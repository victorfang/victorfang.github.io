import markdown2
import sys
import os

# Default CSS style
DEFAULT_CSS = """
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
}

a {
    color: #0366d6;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

code {
    background-color: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
}

pre {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow: auto;
}

pre code {
    background-color: transparent;
    padding: 0;
}

blockquote {
    margin: 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
}

img {
    max-width: 100%;
    height: auto;
}

table {
    border-spacing: 0;
    border-collapse: collapse;
    margin: 16px 0;
}

td, th {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
}
"""

def convert_markdown_to_html(markdown_file, output_dir=None):
    # Read markdown content
    with open(markdown_file, 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert markdown to HTML
    html_content = markdown2.markdown(
        markdown_content,
        extras=['fenced-code-blocks', 'tables', 'code-friendly']
    )
    
    # Create HTML document with CSS
    full_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{os.path.splitext(os.path.basename(markdown_file))[0]}</title>
        <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        <style>
            {DEFAULT_CSS}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Determine output path
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        output_file = os.path.join(
            output_dir,
            os.path.splitext(os.path.basename(markdown_file))[0] + '.html'
        )
    else:
        output_file = os.path.splitext(markdown_file)[0] + '.html'
    
    # Write HTML file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(full_html)
    
    return output_file

def main():
    if len(sys.argv) < 2:
        print("Usage: python md_to_html.py input.md [output_directory]")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        output_file = convert_markdown_to_html(markdown_file, output_dir)
        print(f"Successfully converted {markdown_file} to {output_file}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 