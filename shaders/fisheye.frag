precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uDistortion;

varying vec2 vTexCoord;

void main() {
  // Flip the y-coordinate
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  
  // Calculate aspect ratio to maintain circular shape
  float aspectRatio = uResolution.x / uResolution.y;
  
  // Center the coordinates and adjust for aspect ratio
  uv = uv * 2.0 - 1.0;
  uv.x *= aspectRatio;
  
  // Calculate the distance from the center
  float r = length(uv);
  
  // Normalize radius for consistent distortion
  float normalizedRadius = r / aspectRatio;
  
  // Apply the fish-eye distortion
  float theta = atan(uv.y, uv.x);
  float radius = pow(normalizedRadius, uDistortion) * aspectRatio;
  
  // Convert back to Cartesian coordinates
  uv.x = radius * cos(theta);
  uv.y = radius * sin(theta);
  
  // Adjust back for aspect ratio
  uv.x /= aspectRatio;
  
  // Scale and bias back to texture coordinates
  uv = (uv + 1.0) / 2.0;
  
  // Sample the texture
  vec4 color = texture2D(uTexture, uv);
  
  // Output the color
  gl_FragColor = color;
}

