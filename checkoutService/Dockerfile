FROM microsoft/aspnetcore-build:1.1.4 AS builder
WORKDIR /build
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /publish-output

FROM microsoft/aspnetcore:1.1.4
WORKDIR /app
COPY --from=builder /publish-output .
CMD ["dotnet", "CheckoutService.dll"]

