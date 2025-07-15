import { google } from 'googleapis';
import fs from 'fs/promises';
import { Readable } from 'stream';

// Use service account authentication instead of OAuth2 for backend services
export async function authorize() {
  try {
    // Load credentials from environment or file
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || 
                                 await fs.readFile('./credentials.json', 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    
    return auth;
  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Failed to authorize with Google Drive');
  }
}

export async function uploadFile(authClient, file) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  
  // Create a readable stream from buffer
  const fileStream = new Readable();
  fileStream.push(file.buffer);
  fileStream.push(null);
  
  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.originalname,
        mimeType: file.mimetype,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: file.mimetype,
        body: fileStream,
      },
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Get the file's web view link
    const fileData = await drive.files.get({
      fileId: response.data.id,
      fields: 'webViewLink, webContentLink'
    });

    return {
      id: response.data.id,
      url: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
      webViewLink: fileData.data.webViewLink,
      webContentLink: fileData.data.webContentLink
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file to Google Drive');
  }
}

export async function deleteFile(authClient, fileId) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete file from Google Drive');
  }
}
