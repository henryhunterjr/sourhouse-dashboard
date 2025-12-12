import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_BAKERIES, Bakery, BakeryType, Specialty, calculateDistance } from '@/types';

// GET /api/bakeries - List bakeries with filtering
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse query parameters
  const type = searchParams.get('type') as BakeryType | null;
  const specialties = searchParams.get('specialties')?.split(',') as Specialty[] | undefined;
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 50;
  const search = searchParams.get('search')?.toLowerCase();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let bakeries: Bakery[] = [...SAMPLE_BAKERIES];

  // Filter by type
  if (type) {
    bakeries = bakeries.filter((b) => b.type === type);
  }

  // Filter by specialties
  if (specialties && specialties.length > 0) {
    bakeries = bakeries.filter((b) =>
      specialties.some((s) => b.specialties.includes(s))
    );
  }

  // Filter by search query
  if (search) {
    bakeries = bakeries.filter(
      (b) =>
        b.name.toLowerCase().includes(search) ||
        b.description.toLowerCase().includes(search) ||
        b.city.toLowerCase().includes(search)
    );
  }

  // Filter by radius and add distance
  if (lat !== null && lng !== null) {
    bakeries = bakeries
      .map((b) => ({
        ...b,
        distance: calculateDistance(lat, lng, b.latitude, b.longitude),
      }))
      .filter((b) => (b as Bakery & { distance: number }).distance <= radius)
      .sort((a, b) =>
        ((a as Bakery & { distance: number }).distance || 0) -
        ((b as Bakery & { distance: number }).distance || 0)
      );
  }

  // Pagination
  const total = bakeries.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedBakeries = bakeries.slice(startIndex, endIndex);

  return NextResponse.json({
    bakeries: paginatedBakeries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/bakeries - Submit a new bakery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'type', 'description', 'address', 'city', 'state', 'zip', 'submitter_email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.submitter_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Geocode the address to get lat/lng
    // 2. Save to database with verified: false
    // 3. Send notification email to admin
    // 4. Send confirmation email to submitter

    // For now, just return success
    const newBakery = {
      id: `submission-${Date.now()}`,
      ...body,
      latitude: 0,
      longitude: 0,
      rating: 0,
      review_count: 0,
      featured: false,
      verified: false,
      photos: body.photos || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Bakery submission received. It will be reviewed before being published.',
      bakery: newBakery,
    });
  } catch (error) {
    console.error('Error processing bakery submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
