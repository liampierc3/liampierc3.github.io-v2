# First-Person 3D Experience

This is a minimalist first-person 3D experience created with Three.js. It features a futuristic hallway with interactive elements and a sleek, minimalist design.

## Running the Local Server

To properly test the 3D experience, you need to run it from a local web server. This repository includes several scripts to make this easy, regardless of your operating system.

### Option 1: Using Python (Recommended)

Run the Python script:

```bash
python3 server.py
```

This will start a server and automatically open your default browser to the experience.

### Option 2: Using the Shell Script (macOS/Linux)

If you're on macOS or Linux, you can use the shell script:

```bash
./start-server.sh
```

Then open your browser and navigate to:
```
http://localhost:8000/first-person-experience.html
```

### Option 3: Using the Batch File (Windows)

If you're on Windows, double-click the `start-server.bat` file or run it from Command Prompt:

```
start-server.bat
```

This will start a server and open your browser to the experience.

## Controls

- **Move**: W, A, S, D or Arrow Keys
- **Look**: Mouse movement
- **Interact**: Click on objects

## Browser Compatibility

This experience requires WebGL support. For the best experience, use a modern browser like:
- Chrome
- Firefox
- Edge
- Safari

## Troubleshooting

If you encounter issues:

1. **Server won't start**: Make sure you have Python 3 or Node.js installed.
2. **3D doesn't load**: Check if your browser supports WebGL (most modern browsers do).
3. **Performance issues**: Try closing other applications or tabs to free up resources.
4. **Controls don't work**: Make sure to click once on the experience to enable pointer lock controls. 