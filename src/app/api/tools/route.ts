import { NextResponse } from 'next/server';
import { toolsRegistry, getCategories } from '@/lib/tools-registry';

export async function GET() {
    return NextResponse.json({
        tools: toolsRegistry,
        categories: getCategories(),
        total: toolsRegistry.length,
    });
}
