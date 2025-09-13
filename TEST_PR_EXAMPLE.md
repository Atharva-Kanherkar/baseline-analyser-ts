# Test PR Example: Modern Web Features

This guide shows you exactly how to create a Pull Request that will trigger the Baseline Analyzer and demonstrate all its capabilities.

## 🎯 Step 1: Create Test Repository

```bash
# Create a new repository on GitHub (any name, like "test-baseline-analyzer")
mkdir test-baseline-analyzer
cd test-baseline-analyzer
git init
git remote add origin https://github.com/YOUR_USERNAME/test-baseline-analyzer.git
```

## 📝 Step 2: Add the Workflow File

Create `.github/workflows/baseline-analyzer.yml`:

```yaml
name: PR Baseline Analysis

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  analyze:
    runs-on: ubuntu-latest
    name: Web Platform Compatibility Check
    permissions:
      contents: read
      pull-requests: write
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - name: Run Baseline Analyzer
      uses: Atharva-Kanherkar/baseline-analyser-ts@v1.0.1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        target-browsers: "chrome >= 90, firefox >= 88, safari >= 14"
        severity-filter: "medium"
```

## 🏗️ Step 3: Create Initial Project Structure

```bash
# Create project structure
mkdir -p src/{styles,js,components}
mkdir -p public

# Create initial files
echo "# Test Project" > README.md
echo "node_modules/" > .gitignore
```

Create `src/styles/main.css`:
```css
/* Basic styles - widely supported */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Traditional flexbox - well supported */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

Create `src/js/app.js`:
```javascript
// Traditional JavaScript - widely supported
document.addEventListener('DOMContentLoaded', function() {
  console.log('App initialized');
  
  // Basic DOM manipulation
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', handleClick);
  });
});

function handleClick(event) {
  event.preventDefault();
  console.log('Button clicked');
}
```

Create `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Project</title>
  <link rel="stylesheet" href="../src/styles/main.css">
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>Test Project</h1>
      <nav>
        <a href="#" class="btn">Home</a>
        <a href="#" class="btn">About</a>
      </nav>
    </header>
    <main>
      <p>Welcome to our test project!</p>
    </main>
  </div>
  <script src="../src/js/app.js"></script>
</body>
</html>
```

## 📤 Step 4: Initial Commit

```bash
git add .
git commit -m "Initial project setup with basic web features"
git push -u origin main
```

## 🚀 Step 5: Create PR with Modern Features

Now create a branch with modern web platform features that will trigger the analyzer:

```bash
git checkout -b feature/modern-web-features
```

### Update `src/styles/main.css` (ADD these modern features):

```css
/* Add these modern CSS features to trigger the analyzer */

/* CSS Grid - HIGH baseline (widely supported) */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

/* Container Queries - LIMITED baseline (newer feature) */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
}

/* :has() selector - LIMITED baseline (newer feature) */
.card:has(.featured) {
  border: 3px solid #007acc;
  box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
}

/* Aspect ratio - HIGH baseline */
.media {
  aspect-ratio: 16/9;
  background: #f0f0f0;
}

/* Backdrop filter - LIMITED baseline */
.modal-overlay {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
}

/* CSS Math functions - HIGH baseline */
.responsive-padding {
  padding: clamp(1rem, 5vw, 3rem);
  margin: max(1rem, 2vw);
}

/* Logical properties - HIGH baseline */
.content {
  margin-inline: auto;
  padding-block: 2rem;
  border-inline-start: 4px solid #007acc;
}

/* View Transitions - LOW baseline (very new) */
.page-transition {
  view-transition-name: main-content;
}

::view-transition-old(main-content) {
  transform: translateX(-100%);
}

::view-transition-new(main-content) {
  transform: translateX(100%);
}
```

### Update `src/js/app.js` (ADD these modern features):

```javascript
// Modern JavaScript features that will trigger analysis

// Async/await - HIGH baseline (widely supported)
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
}

// Optional chaining - HIGH baseline
function processUserData(user) {
  const email = user?.profile?.email || 'No email';
  const preferences = user?.settings?.preferences ?? {};
  return { email, preferences };
}

// IntersectionObserver - HIGH baseline
function setupLazyLoading() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-src]').forEach(img => {
    observer.observe(img);
  });
}

// ResizeObserver - HIGH baseline
function setupResponsiveComponents() {
  const resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const { width } = entry.contentRect;
      const element = entry.target;
      
      // Adjust component based on size
      if (width < 300) {
        element.classList.add('compact');
      } else {
        element.classList.remove('compact');
      }
    });
  });

  document.querySelectorAll('.responsive-component').forEach(el => {
    resizeObserver.observe(el);
  });
}

// Private class fields - MEDIUM baseline (newer feature)
class ModernComponent {
  #privateData = new Map();
  
  constructor(element) {
    this.element = element;
    this.#initialize();
  }
  
  #initialize() {
    this.#privateData.set('initialized', Date.now());
  }
  
  getInitTime() {
    return this.#privateData.get('initialized');
  }
}

// Top-level await - LIMITED baseline (newer feature)
// Note: This would be in a module context
// const initialData = await loadData();

// Nullish coalescing - HIGH baseline
function getConfig(options = {}) {
  return {
    theme: options.theme ?? 'light',
    animations: options.animations ?? true,
    timeout: options.timeout ?? 5000
  };
}

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
  setupLazyLoading();
  setupResponsiveComponents();
  
  const data = await loadData();
  if (data) {
    console.log('Data loaded successfully');
  }
});
```

### Create `src/components/modern-dialog.html`:

```html
<!-- Modern HTML features -->
<dialog id="modern-modal" class="modal">
  <form method="dialog">
    <header>
      <h2>Modern Dialog</h2>
      <button value="cancel" aria-label="Close">×</button>
    </header>
    
    <main>
      <p>This uses the native HTML dialog element with modern features.</p>
      
      <!-- Picture element with modern image formats -->
      <picture>
        <source srcset="hero.avif" type="image/avif">
        <source srcset="hero.webp" type="image/webp">
        <img src="hero.jpg" alt="Hero image" loading="lazy" decoding="async">
      </picture>
      
      <!-- Details/Summary - well supported -->
      <details>
        <summary>Advanced Options</summary>
        <fieldset>
          <legend>Preferences</legend>
          <label>
            <input type="checkbox" name="notifications">
            Enable notifications
          </label>
          <label>
            <input type="color" name="theme-color" value="#007acc">
            Theme color
          </label>
        </fieldset>
      </details>
    </main>
    
    <footer>
      <button value="cancel">Cancel</button>
      <button value="confirm">Confirm</button>
    </footer>
  </form>
</dialog>

<!-- Lazy loading images -->
<section class="gallery">
  <img data-src="image1.jpg" alt="Image 1" loading="lazy">
  <img data-src="image2.jpg" alt="Image 2" loading="lazy">
  <img data-src="image3.jpg" alt="Image 3" loading="lazy">
</section>
```

## 📤 Step 6: Commit and Create PR

```bash
# Add all the modern features
git add .
git commit -m "feat: Add modern web platform features

- CSS Grid layouts for responsive design
- Container queries for component-based responsive design  
- :has() selector for advanced styling
- Backdrop filters for modern UI effects
- CSS math functions (clamp, max) for fluid design
- View Transitions API for smooth page transitions
- Modern JavaScript: async/await, optional chaining, private fields
- Web APIs: IntersectionObserver, ResizeObserver
- HTML5: dialog element, picture element, lazy loading

This PR demonstrates various baseline support levels from HIGH (widely supported) 
to LIMITED (newer features) to test the baseline analyzer."

# Push the branch
git push origin feature/modern-web-features
```

## 🎯 Step 7: Create the Pull Request

On GitHub:
1. Go to your repository
2. Click "Compare & pull request" 
3. Title: "Add modern web platform features for baseline testing"
4. Description:
```markdown
## 🚀 Modern Web Features Demo

This PR adds various modern web platform features to test the Baseline Analyzer:

### CSS Features Added:
- ✅ CSS Grid (HIGH baseline - widely supported)
- ⚠️ Container Queries (LIMITED baseline - newer feature)
- ⚠️ :has() selector (LIMITED baseline - newer feature)  
- ✅ Aspect ratio (HIGH baseline)
- ⚠️ Backdrop filter (LIMITED baseline)
- ✅ CSS Math functions (HIGH baseline)
- ❌ View Transitions (LOW baseline - very new)

### JavaScript Features Added:
- ✅ Async/await (HIGH baseline)
- ✅ Optional chaining (HIGH baseline)
- ✅ IntersectionObserver (HIGH baseline)
- ✅ ResizeObserver (HIGH baseline)
- ⚠️ Private class fields (MEDIUM baseline)
- ✅ Nullish coalescing (HIGH baseline)

### HTML Features Added:
- ✅ Dialog element (HIGH baseline)
- ✅ Picture element (HIGH baseline)
- ✅ Lazy loading (HIGH baseline)

**Expected Analysis**: Should detect ~15+ features with mixed baseline support levels.
```

5. Click "Create pull request"

## 🔍 Expected Results

The Baseline Analyzer will:

1. **Automatically trigger** when you create the PR
2. **Detect ~15 web platform features** from your code changes
3. **Post a detailed comment** with:
   - ✅ **Well-supported features** (CSS Grid, fetch, async/await)
   - ⚠️ **Limited baseline features** (Container queries, :has(), backdrop-filter)
   - ❌ **Experimental features** (View Transitions)
   - 💡 **Specific recommendations** for each risky feature

4. **Show risk assessment**: Likely MEDIUM risk due to mix of feature support levels

## 🎉 What This Demonstrates

This test PR will show:
- **Feature detection** across CSS, JavaScript, and HTML
- **Baseline compatibility analysis** using real web-features data
- **Risk assessment** with actionable recommendations
- **Smart filtering** appropriate for a medium-sized PR
- **Educational value** about web platform evolution

Perfect for demonstrating your analyzer to potential users! 🚀
