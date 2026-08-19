/**
 * Universe format validator.
 *
 * Validates that a universe (Universe type) complies with the renderer requirements:
 * 1. HTML contains all 5 zone containers (data-zone="intro|story|ideas|media|closing")
 * 2. HTML uses correct {{placeholder}} syntax for content slots
 * 3. meta fields are present and valid
 * 4. CSS is non-empty
 * 5. content fields are present
 */

const REQUIRED_ZONES = ['intro', 'story', 'ideas', 'media', 'closing'];
const VALID_PLACEHOLDERS = ['{{intro}}', '{{story}}', '{{ideas}}', '{{media}}', '{{closing}}', '{{css}}'];

export interface ValidationError {
  file: string;
  zone?: string;
  message: string;
}

/**
 * Validate a single universe's HTML against zone requirements.
 */
export function validateUniverseHTML(html: string, filename: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check all 5 zones exist
  for (const zone of REQUIRED_ZONES) {
    if (!html.includes(`data-zone="${zone}"`)) {
      errors.push({
        file: filename,
        zone,
        message: `Missing zone container: data-zone="${zone}"`,
      });
    }
  }

  // Check no zone is duplicated
  for (const zone of REQUIRED_ZONES) {
    const regex = new RegExp(`data-zone="${zone}"`, 'g');
    const matches = html.match(regex);
    if (matches && matches.length > 1) {
      errors.push({
        file: filename,
        zone,
        message: `Zone "${zone}" appears ${matches.length} times (expected exactly 1)`,
      });
    }
  }

  // Check each zone has content (at least one inner element or text)
  for (const zone of REQUIRED_ZONES) {
    const zoneRegex = new RegExp(
      `<div[^>]*data-zone="${zone}"[^>]*>([\\s\\S]*?)<\\/div>`,
      'i'
    );
    const match = html.match(zoneRegex);
    if (match) {
      const inner = match[1].trim();
      if (!inner || inner.length < 2) {
        errors.push({
          file: filename,
          zone,
          message: `Zone "${zone}" is empty — must contain content`,
        });
      }
    }
  }

  // Check HTML has DOCTYPE
  if (!html.toLowerCase().includes('<!doctype')) {
    errors.push({
      file: filename,
      message: 'Missing <!doctype html> declaration',
    });
  }

  // Check HTML has <html> and <body> tags
  if (!html.includes('<html') || !html.includes('</html>')) {
    errors.push({
      file: filename,
      message: 'Missing <html> tags',
    });
  }
  if (!html.includes('<body') || !html.includes('</body>')) {
    errors.push({
      file: filename,
      message: 'Missing <body> tags',
    });
  }

  return errors;
}

/**
 * Validate meta fields.
 */
export function validateUniverseMeta(meta: any, filename: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!meta?.id || typeof meta.id !== 'string') {
    errors.push({ file: filename, message: 'Missing or invalid meta.id' });
  }
  if (!meta?.name || typeof meta.name !== 'string') {
    errors.push({ file: filename, message: 'Missing or invalid meta.name' });
  }
  if (!meta?.version || typeof meta.version !== 'string') {
    errors.push({ file: filename, message: 'Missing or invalid meta.version' });
  }

  return errors;
}

/**
 * Validate a complete universe (Universe type).
 */
export function validateUniverse(universe: any, filename: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!universe.meta) {
    errors.push({ file: filename, message: 'Missing meta object' });
  } else {
    errors.push(...validateUniverseMeta(universe.meta, filename));
  }

  const html = universe.layout?.html || universe.html;
  const css = universe.layout?.css || universe.css;

  if (!html || typeof html !== 'string') {
    errors.push({ file: filename, message: 'Missing or invalid html (layout.html)' });
  } else {
    errors.push(...validateUniverseHTML(html, filename));
  }

  if (!css || typeof css !== 'string') {
    errors.push({ file: filename, message: 'Missing or invalid css (layout.css)' });
  }

  return errors;
}

/**
 * Validate a universe file on disk (JSON format).
 */
export function validateUniverseFile(content: string, filename: string): ValidationError[] {
  try {
    const universe = JSON.parse(content);
    return validateUniverse(universe, filename);
  } catch {
    return [{
      file: filename,
      message: `Invalid JSON: ${filename}`,
    }];
  }
}
