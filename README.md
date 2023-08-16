# Geotrack Panel

The geotrack panel attempts to solve the problem of displaying "enriched geospatial data" within grafana. What does this mean? Given a set of GPS coordinates, what do you want to see? For an exercise enthusiast, you may want to see your track against heart rate. Or what happense to your cadence when going uphill? For automotive applications, this may mean looking to see if the brakes are applied, or being ridden while the vehicle is going downhill. For aerospace engine or battery performance aginst a set of GPS coordinates.

Whatever your application, the geotrack panel endevours to solve these problems in 3D.

## Screenshots
![image](https://github.com/srclosson/geotrack-panel/assets/7053010/b83fb1f9-5e79-43fb-9821-987cf275d156)
![image](https://github.com/srclosson/geotrack-panel/assets/7053010/7ecf27c8-1336-4ba4-902c-37eccfdf491e)



## Getting started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev
   ```

   or

   ```bash
   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

## Learn more

- [Build a panel plugin tutorial](https://grafana.com/tutorials/build-a-panel-plugin)
- [Grafana documentation](https://grafana.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/) - Grafana Tutorials are step-by-step guides that help you make the most of Grafana
- [Grafana UI Library](https://developers.grafana.com/ui) - UI components to help you build interfaces using Grafana Design System
