# Capture

Capture is an analytics platform that allows users to capture and fetch
analytical data. It provides a simple and intuitive way to manage analytical
logging and user recognition.

## Features

- **Capture Logs**: Create data captures for different events. Captures can be
  used to store analytical data.
- **Re-capturing**: Get all of your captures with one call.
- **User Fingerprinting**: Identify users across multiple sessions

## Getting Started

To get started with Capture, follow these steps:

1. Go to [our website](https://capture-analytics.vercel.app/) and create a new
   project
2. Copy your keys and project id
3. Follow the installation instructions for your runtime on
   [the JSR page](https://jsr.io/@capture/analytics)
4. Create a new Capture client

```ts
import CaptureClient from "@capture/analytics";

const analytics = new CaptureClient({
  projectId: "",
  key: "", // Can be either public or private, private should not be exposed to the frontend
});
```

## Contributing

Contributions are welcome! If you'd like to contribute to Capture, please fork
the repository and submit a pull request.

## License

Capture is licensed under the MIT License.
