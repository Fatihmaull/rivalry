const fs = require('fs');
const path = require('path');

const files = [
    'src/app/admin/users/page.tsx',
    'src/app/admin/system/page.tsx',
    'src/app/admin/rooms/page.tsx',
    'src/app/admin/interests/page.tsx',
    'src/app/admin/transactions/page.tsx',
    'src/app/wallet/page.tsx',
    'src/app/matchmaking/page.tsx',
    'src/app/rooms/[id]/page.tsx',
    'src/app/feed/page.tsx'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
        console.log(`Not found: ${fullPath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Check if we need to add the import
    if (content.includes('alert(') && !content.includes('import { toast }')) {
        // Find the relative path to src/lib/toast
        const levels = file.split('/').length - 2; // e.g. src/app/feed/page.tsx -> 4 parts -> 2 levels up relative to app
        const relativePrefix = '../'.repeat(levels);
        const importPath = `import { toast } from '${relativePrefix}lib/toast';\n`;

        // Add import after the last import statement or at the top
        const importMatch = content.match(/import .*?;?(\r?\n)/g);
        if (importMatch) {
            const lastImportIndex = content.lastIndexOf(importMatch[importMatch.length - 1]);
            const insertIndex = lastImportIndex + importMatch[importMatch.length - 1].length;
            content = content.slice(0, insertIndex) + importPath + content.slice(insertIndex);
        } else {
            // Put it after 'use client'; if present
            content = content.replace(/('use client';\r?\n)/, `$1${importPath}`);
        }
        modified = true;
    }

    // Replace alert('Invite sent.') with toast.success('Invite sent.')
    if (content.includes("alert('Invite sent.')")) {
        content = content.replace(/alert\('Invite sent\.'\)/g, "toast.success('Invite sent.')");
        modified = true;
    }

    // Replace other static alerts
    if (content.match(/alert\(['"`](.*?)['"`]\)/)) {
        content = content.replace(/alert\(['"`](.*?)['"`]\)/g, "toast.info('$1')");
        modified = true;
    }

    // Replace alert(some.message) with toast.error(some.message)
    if (content.includes("alert(e.message)")) {
        content = content.replace(/alert\(e\.message\)/g, "toast.error(e.message || 'An error occurred')");
        modified = true;
    }
    if (content.includes("alert(err.message)")) {
        content = content.replace(/alert\(err\.message\)/g, "toast.error(err.message || 'An error occurred')");
        modified = true;
    }

    // Generic catch-all for any other alert(err)
    if (content.match(/alert\((.*?)\)/) && modified === false && content.includes('alert(')) {
        content = content.replace(/alert\((.*?)\)/g, "toast.error($1)");
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${file}`);
    }
});
