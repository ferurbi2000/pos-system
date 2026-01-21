import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file received.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Sanitize filename: replace spaces with underscores, lower case, timestamp
        const filename = Date.now() + '_' + file.name.replaceAll(' ', '_').toLowerCase();

        // Save to public/uploads
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        // Return the relative URL
        return NextResponse.json({ url: `/uploads/${filename}` });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}

export const config = {
    api: {
        bodyParser: false, // Disabling Next.js body parser so we can handle formData properly (Mostly for Pages router, but good practice notation)
    },
};
