# Mathematical Pattern Spirograph Studio

An educational creative-coding dashboard structured to plot dynamic mathematical curves into an HTML5 Canvas interface. By configuring radii control parameters and pen lengths, the application tracks custom hypotrochoid roulette vector curves using pure JavaScript parametric calculations.

## Run it
Open `index.html` in any modern browser.

## Features
- **Trigonometric Parameter Deck:** Fine-tune system math coordinates including Outer Ring ($R$), Inner Wheel ($r$), and Pen Offset position values ($p$).
- **Multi-Step Animation Controller:** Harnesses custom micro-stepping calculations per browser request-frame to paint dense geometric patterns without interface stutter.
- **Dynamic Gradient Shaders:** Combines matrix properties to interpolate vibrant glowing vectors using color presets like Cyber Neon and Aurora Borealis.
- **PNG File Exporter:** Renders complete high-definition canvas bitstream captures directly to disk with a single click.
- **Prinstine Core Architecture:** Implemented in pure standard vanilla stack without any framework compilers or styling modules.

## Technical Equations Modeled
The calculations rely entirely on the classic parametric formulas for hypotrochoids:
$$x(\theta) = (R - r)\cos\theta + p\cos\left(\frac{R - r}{r}\theta\right)$$
$$y(\theta) = (R - r)\sin\theta - p\sin\left(\frac{R - r}{r}\theta\right)$$