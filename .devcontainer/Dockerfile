# Base image with .NET SDK (builds both backend and frontend)
FROM mcr.microsoft.com/dotnet/sdk:8.0

# Install Node.js (LTS)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# (optional) expose common dev ports
EXPOSE 5173 5000 5001

# Default shell
CMD ["bash"]
