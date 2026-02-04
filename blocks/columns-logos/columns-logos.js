/**
 * Columns Logos Block - Continuous Scrolling Marquee
 * Creates an infinite horizontal scroll of logos
 */

export default function decorate(block) {
  // Collect all logo images from the block
  const logos = [];
  [...block.querySelectorAll('picture')].forEach((pic) => {
    logos.push(pic.cloneNode(true));
  });

  // Clear the block content
  block.innerHTML = '';

  // Create marquee track (will contain two logo sets for seamless loop)
  const marqueeTrack = document.createElement('div');
  marqueeTrack.classList.add('logo-marquee-track');

  // Create first logo set
  const logoSet1 = document.createElement('div');
  logoSet1.classList.add('logo-set');

  // Add logos to first set
  logos.forEach((pic) => {
    const logoItem = document.createElement('div');
    logoItem.classList.add('logo-item');
    logoItem.append(pic.cloneNode(true));
    logoSet1.append(logoItem);
  });

  // Create second logo set (duplicate for seamless infinite scroll)
  const logoSet2 = logoSet1.cloneNode(true);

  // Append both sets to track
  marqueeTrack.append(logoSet1, logoSet2);

  // Add track to block
  block.append(marqueeTrack);
}
