FROM microsoft/dotnet:1.1-sdk
WORKDIR /app

# copy csproj and restore as distinct layers
COPY CheckoutService.csproj ./
RUN dotnet restore

# copy and build everything else
COPY . ./
RUN dotnet publish -c Release -o out

CMD ["dotnet", "out/CheckoutService.dll", "--server.urls", "http://*:5000"]

