const express = require("express");
const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const router = express.Router();

// Create temp directory for code execution
const tempDir = path.join(os.tmpdir(), "syncide-exec");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Java execution helper
function executeJava(filename, className, tempDir, res) {
  const startTime = Date.now();

  exec(`javac ${filename}`, { cwd: tempDir, timeout: 30000 }, (compileErr, compileOut, compileStderr) => {
    if (compileErr) {
      try { fs.unlinkSync(filename); } catch (e) {}
      return res.json({
        success: false,
        output: "",
        error: `Compilation Error:\n${compileStderr}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    }

    exec(`java -cp ${tempDir} ${className}`, { timeout: 30000 }, (runErr, stdout, stderr) => {
      const duration = Date.now() - startTime;
      try {
        fs.unlinkSync(filename);
        fs.unlinkSync(path.join(tempDir, `${className}.class`));
      } catch (e) {}

      res.json({
        success: !runErr,
        output: stdout,
        error: stderr || (runErr ? runErr.message : ""),
        exitCode: runErr ? 1 : 0,
        duration,
      });
    });
  });
}

// C/C++ execution helper
function executeCpp(filename, outputFile, language, res) {
  const startTime = Date.now();
  const compiler = language === "cpp" ? "g++" : "gcc";

  exec(`${compiler} ${filename} -o ${outputFile}`, { timeout: 30000 }, (compileErr, compileOut, compileStderr) => {
    if (compileErr) {
      try { fs.unlinkSync(filename); } catch (e) {}
      return res.json({
        success: false,
        output: "",
        error: `Compilation Error:\n${compileStderr}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    }

    exec(outputFile, { timeout: 30000 }, (runErr, stdout, stderr) => {
      const duration = Date.now() - startTime;
      try {
        fs.unlinkSync(filename);
        fs.unlinkSync(outputFile);
      } catch (e) {}

      res.json({
        success: !runErr,
        output: stdout,
        error: stderr || (runErr ? runErr.message : ""),
        exitCode: runErr ? 1 : 0,
        duration,
      });
    });
  });
}

// Rust execution helper
function executeRust(filename, outputFile, res) {
  const startTime = Date.now();

  exec(`rustc ${filename} -o ${outputFile}`, { timeout: 30000 }, (compileErr, compileOut, compileStderr) => {
    if (compileErr) {
      try { fs.unlinkSync(filename); } catch (e) {}
      return res.json({
        success: false,
        output: "",
        error: `Compilation Error:\n${compileStderr}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    }

    exec(outputFile, { timeout: 30000 }, (runErr, stdout, stderr) => {
      const duration = Date.now() - startTime;
      try {
        fs.unlinkSync(filename);
        fs.unlinkSync(outputFile);
      } catch (e) {}

      res.json({
        success: !runErr,
        output: stdout,
        error: stderr || (runErr ? runErr.message : ""),
        exitCode: runErr ? 1 : 0,
        duration,
      });
    });
  });
}

// Execute code
router.post("/", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const timestamp = Date.now();
  let filename, command, args;

  try {
    switch (language) {
      case "javascript":
        filename = path.join(tempDir, `code_${timestamp}.js`);
        fs.writeFileSync(filename, code);
        command = "node";
        args = [filename];
        break;

      case "python":
        filename = path.join(tempDir, `code_${timestamp}.py`);
        fs.writeFileSync(filename, code);
        command = "python3";
        args = [filename];
        break;

      case "typescript":
        filename = path.join(tempDir, `code_${timestamp}.ts`);
        fs.writeFileSync(filename, code);
        command = "npx";
        args = ["ts-node", filename];
        break;

      case "java": {
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : "Main";
        filename = path.join(tempDir, `${className}.java`);
        fs.writeFileSync(filename, code);
        return executeJava(filename, className, tempDir, res);
      }

      case "cpp":
      case "c": {
        const ext = language === "cpp" ? "cpp" : "c";
        filename = path.join(tempDir, `code_${timestamp}.${ext}`);
        const outputFile = path.join(tempDir, `code_${timestamp}`);
        fs.writeFileSync(filename, code);
        return executeCpp(filename, outputFile, language, res);
      }

      case "go":
        filename = path.join(tempDir, `code_${timestamp}.go`);
        fs.writeFileSync(filename, code);
        command = "go";
        args = ["run", filename];
        break;

      case "rust": {
        filename = path.join(tempDir, `code_${timestamp}.rs`);
        const rustOutput = path.join(tempDir, `code_${timestamp}`);
        fs.writeFileSync(filename, code);
        return executeRust(filename, rustOutput, res);
      }

      case "ruby":
        filename = path.join(tempDir, `code_${timestamp}.rb`);
        fs.writeFileSync(filename, code);
        command = "ruby";
        args = [filename];
        break;

      case "php":
        filename = path.join(tempDir, `code_${timestamp}.php`);
        fs.writeFileSync(filename, code);
        command = "php";
        args = [filename];
        break;

      case "bash":
      case "shell":
        filename = path.join(tempDir, `code_${timestamp}.sh`);
        fs.writeFileSync(filename, code);
        command = "bash";
        args = [filename];
        break;

      default:
        return res.status(400).json({ error: `Language '${language}' is not supported for execution` });
    }

    // Execute the code
    const startTime = Date.now();
    const child = spawn(command, args, {
      timeout: 30000,
      cwd: tempDir,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (exitCode) => {
      const duration = Date.now() - startTime;
      try { fs.unlinkSync(filename); } catch (e) {}

      res.json({
        success: exitCode === 0,
        output: stdout,
        error: stderr,
        exitCode,
        duration,
      });
    });

    child.on("error", (err) => {
      try { fs.unlinkSync(filename); } catch (e) {}

      res.json({
        success: false,
        output: "",
        error: err.message,
        exitCode: 1,
        duration: 0,
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
