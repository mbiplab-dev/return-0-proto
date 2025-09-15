// =============================================================================
// UPDATED MAP SCREEN WITH STATIC AND DYNAMIC HAZARD DETECTION
// File path: client/src/components/screens/MapScreen.tsx
// =============================================================================

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";

import { AlertTriangle, Navigation, Users } from "lucide-react";
import Header from "../layout/Header";
import GroupMemberItem from "../common/GroupMemberItem";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import notificationService from "../../services/notificationService";

import type {  FeatureCollection, Polygon} from "geojson";
interface MapScreenProps {
  groupMembers: any[];
  mapContainer: any;
}

// ✅ Define interface for properties to include 'name'
interface RestrictedAreaProperties {
  name?: string;
}

// ✅ Explicitly type geojsonData as FeatureCollection with Polygon geometry
const geojsonData: FeatureCollection<Polygon, RestrictedAreaProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 1" },
      geometry: {
        coordinates: [
          [
            [93.16495863862121, 26.552621054586794],
            [93.19932017385474, 26.39122928395662],
            [93.3858775112833, 26.581408004865963],
            [93.31452114276584, 26.596440990775903],
            [93.26138316868179, 26.58017222397166],
            [93.16495863862121, 26.552621054586794],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 2" },
      geometry: {
        coordinates: [
          [
            [93.35423727078302, 26.355460048279525],
            [93.0130711314194, 26.242286168160106],
            [93.07781466825566, 26.1107433548827],
            [93.66393758104971, 26.22133361823701],
            [93.4903277319209, 26.576462759278584],
            [93.35423727078302, 26.355460048279525],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 3" },
      geometry: {
        coordinates: [
          [
            [93.00843917124621, 25.992072656291725],
            [92.79410375150132, 25.954904836769316],
            [92.95487418380554, 25.817210363256805],
            [93.37880424384912, 25.828463892745816],
            [93.42767537248221, 26.028008626514847],
            [93.00843917124621, 25.992072656291725],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 4" },
      geometry: {
        coordinates: [
          [
            [92.46496998455467, 26.13594583571863],
            [92.48630336952488, 25.914494149405257],
            [92.41877971980483, 25.87031957652539],
            [92.8348975644887, 26.09511169480149],
            [92.83782423867501, 26.17936809802609],
            [92.57843546322755, 26.260305626827744],
            [92.46496998455467, 26.13594583571863],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 5" },
      geometry: {
        coordinates: [
          [
            [92.17606803570374, 25.96800397224115],
            [91.86775182260368, 25.711555828926464],
            [91.89434484239433, 25.5053546888374],
            [92.38524400405299, 25.50206704211685],
            [92.31604743606181, 26.193065644028025],
            [92.17606803570374, 25.96800397224115],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 6" },
      geometry: {
        coordinates: [
          [
            [92.76153278182, 25.655951820097556],
            [92.73539507100742, 25.739900998958063],
            [92.61556494918023, 25.719155739130187],
            [92.54554211125804, 25.637991739319475],
            [92.49369825664314, 25.113588297782158],
            [93.37776703243765, 25.19906962464009],
            [93.71110141784675, 25.7163091215903],
            [92.76153278182, 25.655951820097556],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 7" },
      geometry: {
        coordinates: [
          [
            [90.71119784475167, 25.58386743986665],
            [90.97394118328162, 25.392173828693103],
            [91.14539791072974, 25.387218869104345],
            [91.14267644984665, 25.50447855013877],
            [91.578500574354, 25.64008030000315],
            [91.6762185998677, 26.088673169591374],
            [90.71119784475167, 25.58386743986665],
          ],
        ],
        type: "Polygon",
      },
    },
    {
      type: "Feature",
      properties: { name: "Assam Restricted Zone 8" },
      geometry: {
        coordinates: [
          [
            [93.72693820400303, 26.017921607361373],
            [94.3037576293259, 26.117533039376895],
            [94.25642693601742, 26.43705359727643],
            [94.83926567563185, 26.409603432881525],
            [94.72986888028947, 26.832858523799615],
            [93.89406650979265, 26.640630723598576],
            [93.72693820400303, 26.017921607361373],
          ],
        ],
        type: "Polygon",
      },
    },
  ],
};

const MapScreen: React.FC<MapScreenProps> = ({ groupMembers, mapContainer }) => {
  // ✅ Type geojsonDataRef to match FeatureCollection
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const geojsonDataRef = useRef<FeatureCollection<Polygon, RestrictedAreaProperties>>(null);
  const hazardDataRef = useRef<any>({ sachet: [], landslide: [] });
  const { t } = useTranslation();

  // Helper function to create notification for hazard alert
  const createHazardNotification = async (
    hazardType: string,
    message: string,
    location?: any
  ) => {
    try {
      const lngLat = markerRef.current?.getLngLat();
      const notificationLocation =
        location ||
        (lngLat
          ? {
              type: "Point",
              coordinates: [lngLat.lng, lngLat.lat] as [number, number],
              address: "Current Location",
            }
          : undefined);

      await notificationService.handleMapHazardAlert(
        hazardType,
        message,
        notificationLocation
      );
    } catch (error) {
      console.error("Failed to create hazard notification:", error);
    }
  };

  // Function to check if point is inside hazard circles
  const checkHazardCollision = (userPoint: any) => {
    const hazardMessages: string[] = [];
    const baseRadius = 2; // km - same as your static radius

    hazardDataRef.current.sachet.forEach((sachetItem: any) => {
      if (!sachetItem.centroid) return;

      const [lon, lat] = sachetItem.centroid.split(",").map(Number);
      const hazardCenter = turf.point([lon, lat]);
      const distance = turf.distance(userPoint, hazardCenter, {
        units: "kilometers",
      });

      if (distance <= baseRadius) {
        const message =
          t("map.disasterAlert") +
          ": " +
          sachetItem.area_description +
          ", " +
          t("map.severity") +
          ": " +
          sachetItem.severity;
        hazardMessages.push(message);

        createHazardNotification(
          "sachet",
          `Disaster alert in your area: ${sachetItem.area_description}. Severity level: ${sachetItem.severity}. Please take necessary precautions.`,
          {
            type: "Point",
            coordinates: [lon, lat] as [number, number],
            address: sachetItem.area_description || "Alert Area",
          }
        );
      }
    });

    hazardDataRef.current.landslide.forEach((landslideItem: any) => {
      if (!landslideItem.lat || !landslideItem.lon) return;

      const hazardCenter = turf.point([landslideItem.lon, landslideItem.lat]);
      const distance = turf.distance(userPoint, hazardCenter, {
        units: "kilometers",
      });

      if (distance <= baseRadius) {
        const message =
          t("map.landslideAlert") +
          ": " +
          landslideItem.state +
          ", " +
          landslideItem.district +
          ", " +
          landslideItem.location +
          ", " +
          landslideItem.status;
        hazardMessages.push(message);

        createHazardNotification(
          "landslide",
          `Landslide hazard detected at your location. Area: ${landslideItem.location}, ${landslideItem.district}, ${landslideItem.state}. Status: ${landslideItem.status}. Please avoid this area and move to safety.`,
          {
            type: "Point",
            coordinates: [landslideItem.lon, landslideItem.lat] as [number, number],
            address: `${landslideItem.location}, ${landslideItem.district}, ${landslideItem.state}`,
          }
        );
      }
    });

    return hazardMessages;
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

    // Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [92.9376, 26.2006], // Assam
      zoom: 6,
    });

    mapRef.current.on("load", async () => {
      // ✅ Use static GeoJSON data
      geojsonDataRef.current = geojsonData;

      mapRef.current!.addSource("restricted-areas", {
        type: "geojson",
        data: geojsonData,
      });

      mapRef.current!.addLayer({
        id: "restricted-fill",
        type: "fill",
        source: "restricted-areas",
        paint: { "fill-color": "#f1f100", "fill-opacity": 0.4 },
      });

      // ✅ Optional: Add outline for better visibility
      mapRef.current!.addLayer({
        id: "restricted-outline",
        type: "line",
        source: "restricted-areas",
        paint: {
          "line-color": "#f1c100",
          "line-width": 2,
          "line-opacity": 0.8,
        },
      });

      // Draggable marker
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([92.9376, 26.2006])
        .addTo(mapRef.current!);

      const fetchHazards = async () => {
        try {
          const [sachetRes, landslideRes] = await Promise.all([
            fetch("/sachet"),
            fetch("/landslide"),
          ]);

          if (!sachetRes.ok || !landslideRes.ok) {
            throw new Error("Failed to fetch hazard APIs");
          }

          const [sachetData, landslideData] = await Promise.all([
            sachetRes.json(),
            landslideRes.json(),
          ]);

          hazardDataRef.current = {
            sachet: sachetData,
            landslide: landslideData,
          };

          const baseRadius = 2; // km
          let t = 0;

          const buildPolygons = (scale: number) => {
            const features: GeoJSON.Feature<GeoJSON.Geometry>[] = [];

            sachetData.forEach((a: any) => {
              if (!a.centroid) return;
              const [lon, lat] = a.centroid.split(",").map(Number);
              const circle = turf.circle([lon, lat], baseRadius * scale, {
                units: "kilometers",
                steps: 64,
              });
              features.push({
                type: "Feature",
                geometry: circle.geometry,
                properties: { ...a, type: "Sachet" },
              });
            });

            landslideData.forEach((ls: any) => {
              if (!ls.lat || !ls.lon) return;
              const circle = turf.circle([ls.lon, ls.lat], baseRadius * scale, {
                units: "kilometers",
                steps: 64,
              });
              features.push({
                type: "Feature",
                geometry: circle.geometry,
                properties: { ...ls, type: "Landslide" },
              });
            });

            return {
              type: "FeatureCollection",
              features,
            } as GeoJSON.FeatureCollection;
          };

          const staticPolygons = buildPolygons(1);

          mapRef.current!.addSource("static-hazards", {
            type: "geojson",
            data: staticPolygons,
          });

          mapRef.current!.addLayer({
            id: "static-hazard-fill",
            type: "fill",
            source: "static-hazards",
            paint: {
              "fill-color": "rgba(255,0,0,0.2)",
              "fill-outline-color": "red",
            },
          });

          mapRef.current!.addSource("hazards", {
            type: "geojson",
            data: buildPolygons(1),
          });

          mapRef.current!.addLayer({
            id: "hazard-fill",
            type: "fill",
            source: "hazards",
            paint: {
              "fill-color": "rgba(255,0,0,0.3)",
              "fill-outline-color": "red",
            },
          });

          function animatePolygons() {
            t = (t + 0.01) % (2 * Math.PI);
            const scale = 2 + 1 * Math.sin(t);
            (mapRef.current!.getSource("hazards") as any).setData(
              buildPolygons(scale)
            );
            requestAnimationFrame(animatePolygons);
          }
          animatePolygons();
        } catch (err) {
          console.error("Failed to fetch hazards:", err);
        }
      };
      await fetchHazards();

      markerRef.current!.on("dragend", async () => {
        const lngLat = markerRef.current!.getLngLat();
        const point = turf.point([lngLat.lng, lngLat.lat]);

        const hazardMessages: string[] = [];

        geojsonDataRef.current?.features.forEach((feature: any) => {
          if (turf.booleanPointInPolygon(point, feature)) {
            const message =
              t("map.restrictedArea") + ": " + (feature.properties.name || "");
            hazardMessages.push(message);

            createHazardNotification(
              "restricted_area",
              `You have entered a restricted area: ${
                feature.properties.name || "Unknown area"
              }. Please move to a safe location.`,
              {
                type: "Point",
                coordinates: [lngLat.lng, lngLat.lat] as [number, number],
                address: feature.properties.name || "Restricted Area",
              }
            );
          }
        });

        const staticHazardMessages = checkHazardCollision(point);
        hazardMessages.push(...staticHazardMessages);

        if (hazardMessages.length > 0) {
          toast.error(hazardMessages.join("\n"));
        } else {
          toast.success(t("map.safeZoneMessage"));
        }
      });
    });

    return () => mapRef.current?.remove();
  }, [t]);

  return (
    <div className="space-y-4">
      <Header title={t("map.liveMap")} />

      <div className="px-4 space-y-4">
        <div className="relative">
          <div
            ref={mapContainer}
            className="w-full h-96 rounded-2xl overflow-hidden shadow-lg"
          />

          <div className="absolute top-4 left-4 bg-white rounded-xl p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-gray-600">Live Tracking</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-white rounded-xl p-3 shadow-lg">
            <button
              className="text-sm font-medium text-blue-600"
              onClick={() => {
                if (mapRef.current && markerRef.current) {
                  mapRef.current.flyTo({
                    center: markerRef.current.getLngLat(),
                    zoom: 7,
                  });
                }
              }}
            >
              {t("map.recenter")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <Users className="text-purple-600 mx-auto mb-2" size={24} />
            <p className="text-lg font-bold text-gray-900">
              {groupMembers.filter((m) => m.status === "safe").length}/
              {groupMembers.length}
            </p>
            <p className="text-xs text-gray-500">{t("map.safe")}</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <AlertTriangle className="text-orange-600 mx-auto mb-2" size={24} />
            <p className="text-lg font-bold text-gray-900">
              {hazardDataRef.current.sachet.length +
                hazardDataRef.current.landslide.length}
            </p>
            <p className="text-xs text-gray-500">{t("map.warnings")}</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <Navigation className="text-blue-600 mx-auto mb-2" size={24} />
            <p className="text-lg font-bold text-gray-900">0.8km</p>
            <p className="text-xs text-gray-500">{t("map.toHotel")}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">
            {t("map.travelGroup")}
          </h3>
          <div className="space-y-3">
            {groupMembers.map((member) => (
              <GroupMemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;