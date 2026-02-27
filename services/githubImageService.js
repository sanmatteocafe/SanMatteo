/**
 * GitHub Image Upload Service
 * Uploads images to a GitHub repo and returns the raw URL.
 *
 * Required ENV vars:
 *   NEXT_PUBLIC_GITHUB_TOKEN  — Personal Access Token with 'repo' scope
 *   NEXT_PUBLIC_GITHUB_REPO   — e.g. "username/repo-name"
 */

const GITHUB_API = 'https://api.github.com';

export async function uploadImageToGitHub(file) {
    const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;

    if (!token || !repo) {
        throw new Error('GitHub token or repo not configured in .env.local');
    }

    // Convert file to base64
    const base64 = await fileToBase64(file);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const safeName = file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()
        .slice(0, 30);
    const path = `menu-images/${safeName}-${timestamp}.${ext}`;

    // Upload via GitHub API
    const response = await fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
            message: `Upload menu image: ${file.name}`,
            content: base64,
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to upload image to GitHub');
    }

    const data = await response.json();

    // Return the raw URL for direct image access
    // Format: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
    const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${path}`;
    return rawUrl;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix (data:image/png;base64,)
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
