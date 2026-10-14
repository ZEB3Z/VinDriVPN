const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

// Mimics the small subset of the Cloudinary uploader API this project uses,
// but saves base64 data URIs to local disk instead of a cloud service.
// folder: 'products' | 'avatars'
// dataUri: a "data:image/png;base64,...." string (what the frontend already sends)
function saveDataUri(dataUri, folder) {
    const match = /^data:(image\/(png|jpe?g));base64,(.+)$/.exec(dataUri || '');
    if (!match) {
        throw new Error('Unsupported image format. Please upload a PNG or JPEG image.');
    }
    const ext = match[2] === 'jpg' ? 'jpeg' : match[2];
    const base64Data = match[3];
    const folderPath = path.join(UPLOADS_ROOT, folder);
    fs.mkdirSync(folderPath, { recursive: true });

    const publicId = `${folder}/${crypto.randomBytes(10).toString('hex')}`;
    const fileName = `${path.basename(publicId)}.${ext}`;
    const filePath = path.join(folderPath, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    return {
        public_id: publicId, // e.g. "products/ab12cd34ef"
        // URL is relative; the frontend prefixes it with the API origin.
        secure_url: `/uploads/${folder}/${fileName}`
    };
}

function destroy(publicId) {
    if (!publicId) return;
    // publicId looks like "products/ab12cd34ef" but the file on disk has an extension.
    const folderPath = path.join(UPLOADS_ROOT, path.dirname(publicId));
    const baseName = path.basename(publicId);
    if (!fs.existsSync(folderPath)) return;
    for (const file of fs.readdirSync(folderPath)) {
        if (file.startsWith(baseName)) {
            fs.unlinkSync(path.join(folderPath, file));
        }
    }
}

module.exports = { saveDataUri, destroy };
