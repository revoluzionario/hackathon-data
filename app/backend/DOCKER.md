# Docker instructions

This file describes how to build and run a production Docker image for the NestJS backend.

Build the image (expects `dist` to be present after `npm run build`):

```bash
docker build -t hackathon-data-backend:latest .
```

Run the container:

```bash
docker run -p 3000:3000 --rm hackathon-data-backend:latest
```

Notes:
- For development, you can run the app locally with `npm run start:dev` and avoid rebuilding the image frequently.
- You can add a `docker-compose.yml` for convenience that mounts the source and forwards ports.
