import os

script_tag = '<script src="assets/js/script.js"></script>'

def add_script_tag(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if script_tag in content:
        print(f"Script tag already exists in {file_path}")
        return

    # Insert before </body>
    if '</body>' in content:
        updated_content = content.replace('</body>', f'	{script_tag}\n</body>')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Added script tag to {file_path}")
    else:
        print(f"Could not find </body> in {file_path}")

if __name__ == "__main__":
    for filename in os.listdir('.'):
        if filename.endswith('.html'):
            add_script_tag(filename)
