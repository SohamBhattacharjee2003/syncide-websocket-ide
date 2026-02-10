import { languages } from '../constants';

// Get boilerplate code for a language
export const getBoilerplate = (lang) => {
  const date = new Date().toLocaleDateString();
  const templates = {
    javascript: `// JavaScript - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfunction main() {\n  // Your code here\n  console.log("Hello, SyncIDE!");\n}\n\nmain();\n`,
    typescript: `// TypeScript - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfunction main(): void {\n  // Your code here\n  console.log("Hello, SyncIDE!");\n}\n\nmain();\n`,
    python: `# Python - SyncIDE\n# Author: Your Name\n# Date: ${date}\n\ndef main():\n    # Your code here\n    print("Hello, SyncIDE!")\n\nif __name__ == "__main__":\n    main()\n`,
    java: `// Java - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n        System.out.println("Hello, SyncIDE!");\n    }\n}\n`,
    cpp: `// C++ - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    cout << "Hello, SyncIDE!" << endl;\n    return 0;\n}\n`,
    c: `// C - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    printf("Hello, SyncIDE!\\n");\n    return 0;\n}\n`,
    rust: `// Rust - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfn main() {\n    // Your code here\n    println!("Hello, SyncIDE!");\n}\n`,
    go: `// Go - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // Your code here\n    fmt.Println("Hello, SyncIDE!")\n}\n`,
    ruby: `# Ruby - SyncIDE\n# Author: Your Name\n# Date: ${date}\n\ndef main\n  # Your code here\n  puts "Hello, SyncIDE!"\nend\n\nmain\n`,
    php: `<?php\n// PHP - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfunction main() {\n    // Your code here\n    echo "Hello, SyncIDE!";\n}\n\nmain();\n?>\n`,
    swift: `// Swift - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nimport Foundation\n\nfunc main() {\n    // Your code here\n    print("Hello, SyncIDE!")\n}\n\nmain()\n`,
    kotlin: `// Kotlin - SyncIDE\n// Author: Your Name\n// Date: ${date}\n\nfun main() {\n    // Your code here\n    println("Hello, SyncIDE!")\n}\n`,
    html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>SyncIDE</title>\n</head>\n<body>\n    <!-- Your code here -->\n    <h1>Hello, SyncIDE!</h1>\n</body>\n</html>\n`,
    css: `/* CSS - SyncIDE */\n/* Author: Your Name */\n/* Date: ${date} */\n\nbody {\n    /* Your styles here */\n    font-family: sans-serif;\n}\n`,
    json: `{\n  "name": "syncide-project",\n  "version": "1.0.0"\n}\n`,
  };
  return templates[lang] || templates.javascript;
};

// Get initial file
export const getInitialFile = (lang = "javascript") => ({
  id: "1",
  name: `main.${languages[lang]?.ext || "js"}`,
  type: "file",
  language: lang,
  content: getBoilerplate(lang),
});
