import hljs from 'highlight.js/lib/core';

// Register the necessary languages
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import java from 'highlight.js/lib/languages/java';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import markdown from 'highlight.js/lib/languages/markdown';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import sql from 'highlight.js/lib/languages/sql';
import php from 'highlight.js/lib/languages/php';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import ruby from 'highlight.js/lib/languages/ruby';
import dart from 'highlight.js/lib/languages/dart';
import diff from 'highlight.js/lib/languages/diff';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import graphql from 'highlight.js/lib/languages/graphql';
import http from 'highlight.js/lib/languages/http';
import ini from 'highlight.js/lib/languages/ini';
import latex from 'highlight.js/lib/languages/latex';
import objectivec from 'highlight.js/lib/languages/objectivec';
import perl from 'highlight.js/lib/languages/perl';
import plaintext from 'highlight.js/lib/languages/plaintext';
import r from 'highlight.js/lib/languages/r';
import scala from 'highlight.js/lib/languages/scala';
import powershell from 'highlight.js/lib/languages/powershell';

// Register each language with highlight.js
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript); // Alias for javascript
hljs.registerLanguage('java', java);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);
hljs.registerLanguage('sh', shell); // Alias for shell
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml); // Alias for yaml
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', xml); // HTML uses the XML language
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown); // Alias for markdown
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('php', php);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp); // Alias for csharp
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c++', cpp); // Alias for cpp
hljs.registerLanguage('go', go);
hljs.registerLanguage('golang', go); // Alias for go
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust); // Alias for rust
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('kt', kotlin); // Alias for kotlin
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby); // Alias for ruby
hljs.registerLanguage('dart', dart);
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('docker', dockerfile); // Alias for dockerfile
hljs.registerLanguage('graphql', graphql);
hljs.registerLanguage('gql', graphql); // Alias for graphql
hljs.registerLanguage('http', http);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('latex', latex);
hljs.registerLanguage('tex', latex); // Alias for latex
hljs.registerLanguage('objectivec', objectivec);
hljs.registerLanguage('objc', objectivec); // Alias for objectivec
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('pl', perl); // Alias for perl
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('text', plaintext); // Alias for plaintext
hljs.registerLanguage('r', r);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('ps', powershell); // Alias for powershell

/**
 * Utility function to detect the programming language from a code string
 * @param code - The code string to analyze
 * @returns The detected language or 'plaintext' if undetermined
 */
export const detectLanguage = (code: string): string => {
  // Try automatic detection with highlight.js
  const detection = hljs.highlightAuto(code, [
    'typescript', 'javascript', 'python', 'java', 'html', 'css', 
    'json', 'bash', 'yaml', 'sql', 'php', 'csharp', 'cpp'
  ]);
  
  return detection.language || 'plaintext';
};

/**
 * Utility function to highlight syntax in a code string
 * @param code - The code string to highlight
 * @param language - The programming language (optional, will auto-detect if not provided)
 * @returns An HTML string containing the formatted code
 */
export const highlightCode = (code: string, language?: string): string => {
  if (!language) {
    language = detectLanguage(code);
  }
  
  try {
    return hljs.highlight(code, { language }).value;
  } catch (error) {
    // If the language is not supported, fall back to plaintext
    return hljs.highlight(code, { language: 'plaintext' }).value;
  }
};

// Export the registered hljs instance and utility functions
export default hljs;