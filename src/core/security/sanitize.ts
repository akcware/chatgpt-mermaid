import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize SVG to remove potentially dangerous elements and attributes
 * @param svg - Raw SVG string
 * @returns Sanitized SVG string
 */
export function sanitizeSvg(svg: string): string {
  if (!svg || typeof svg !== 'string') {
    throw new Error('Invalid input: svg must be a non-empty string');
  }

  // Configure DOMPurify to allow only safe SVG elements
  const config = {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: [
      'svg',
      'g',
      'path',
      'circle',
      'rect',
      'line',
      'polyline',
      'polygon',
      'ellipse',
      'text',
      'tspan',
      'defs',
      'linearGradient',
      'radialGradient',
      'stop',
      'clipPath',
      'marker',
      'pattern',
      'image',
      'use',
      'desc',
      'title',
      'metadata',
    ],
    ALLOWED_ATTR: [
      'id',
      'class',
      'style',
      'x',
      'y',
      'x1',
      'y1',
      'x2',
      'y2',
      'cx',
      'cy',
      'r',
      'rx',
      'ry',
      'width',
      'height',
      'd',
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-dasharray',
      'opacity',
      'fill-opacity',
      'stroke-opacity',
      'transform',
      'viewBox',
      'preserveAspectRatio',
      'xmlns',
      'xmlns:xlink',
      'version',
      'points',
      'text-anchor',
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'dominant-baseline',
      'alignment-baseline',
      'offset',
      'stop-color',
      'stop-opacity',
      'gradientUnits',
      'gradientTransform',
      'spreadMethod',
      'href',
      'xlink:href',
      'clip-path',
      'marker-start',
      'marker-mid',
      'marker-end',
      'markerWidth',
      'markerHeight',
      'markerUnits',
      'orient',
      'refX',
      'refY',
      'patternUnits',
      'patternContentUnits',
      'patternTransform',
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
  };

  // Sanitize the SVG
  const sanitized = DOMPurify.sanitize(svg, config);

  if (!sanitized) {
    throw new Error('Failed to sanitize SVG');
  }

  return sanitized;
}

