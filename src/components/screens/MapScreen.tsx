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

interface MapScreenProps {
  groupMembers: any[];
  mapContainer: any;
}

const MapScreen: React.FC<MapScreenProps> = ({
  groupMembers,
  mapContainer,
}) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const geojsonDataRef = useRef<any>(null);
  // Store hazard data separately for collision detection
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

    // Check Sachet hazards
    hazardDataRef.current.sachet.forEach((sachetItem: any) => {
      if (!sachetItem.centroid) return;
      
      const [lon, lat] = sachetItem.centroid.split(",").map(Number);
      const hazardCenter = turf.point([lon, lat]);
      const distance = turf.distance(userPoint, hazardCenter, { units: 'kilometers' });
      
      if (distance <= baseRadius) {
        const message = t("map.disasterAlert") + ": " + sachetItem.area_description + ", " + t("map.severity") + ": " + sachetItem.severity;
        hazardMessages.push(message);

        // Create notification for sachet alert
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

    // Check Landslide hazards
    hazardDataRef.current.landslide.forEach((landslideItem: any) => {
      if (!landslideItem.lat || !landslideItem.lon) return;
      
      const hazardCenter = turf.point([landslideItem.lon, landslideItem.lat]);
      const distance = turf.distance(userPoint, hazardCenter, { units: 'kilometers' });
      
      if (distance <= baseRadius) {
        const message = t("map.landslideAlert") + ": " + landslideItem.state + ", " + landslideItem.district + ", " + landslideItem.location + ", " + landslideItem.status;
        hazardMessages.push(message);

        // Create notification for landslide
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

    // ✅ Initialize map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [92.9376, 26.2006], // Assam
      zoom: 6,
    });

    mapRef.current.on("load", async () => {
      // ✅ Load restricted areas
      const response = await fetch("/data.json");
      const geojson = await response.json();
      geojsonDataRef.current = geojson;

      mapRef.current!.addSource("restricted-areas", {
        type: "geojson",
        data: geojson,
      });

      mapRef.current!.addLayer({
        id: "restricted-fill",
        type: "fill",
        source: "restricted-areas",
        paint: { "fill-color": "#f1f100", "fill-opacity": 0.4 },
      });

      // ✅ Draggable marker
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

          // Store hazard data for collision detection
          hazardDataRef.current = {
            sachet: sachetData,
            landslide: landslideData
          };

          const baseRadius = 2; // km
          let t = 0;

          // ✅ Build animated polygons
          const buildPolygons = (scale: number) => {
            const features: GeoJSON.Feature<GeoJSON.Geometry>[] = [];

            // Sachet alerts → animated circles
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

            // Landslides → animated circles
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

          // ✅ Add static hazard circles (for visual reference)
          const staticPolygons = buildPolygons(1); // Static size
          
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

          // ✅ Add animated hazard circles
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

          // ✅ Animation loop (only affects visual display)
          function animatePolygons() {
            t = (t + 0.01) % (2 * Math.PI);
            const scale = 2 + 1 * Math.sin(t); // oscillates between 1-3
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

      // ✅ Marker dragend handler with improved collision detection
      markerRef.current!.on("dragend", async () => {
        const lngLat = markerRef.current!.getLngLat();
        const point = turf.point([lngLat.lng, lngLat.lat]);

        const hazardMessages: string[] = [];

        // Check restricted areas (existing logic)
        geojsonDataRef.current.features.forEach((feature: any) => {
          if (turf.booleanPointInPolygon(point, feature)) {
            const message =
              t("map.restrictedArea") + ": " + (feature.properties.name || "");
            hazardMessages.push(message);

            // Create notification for restricted area
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

        // Check static hazard areas (NEW LOGIC)
        const staticHazardMessages = checkHazardCollision(point);
        hazardMessages.push(...staticHazardMessages);

        // Display combined alert
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
        {/* Map Container */}
        <div className="relative">
          <div
            ref={mapContainer}
            className="w-full h-96 rounded-2xl overflow-hidden shadow-lg"
          />

          {/* Map Overlay Controls */}
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

        {/* Quick Stats */}
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
              {hazardDataRef.current.sachet.length + hazardDataRef.current.landslide.length}
            </p>
            <p className="text-xs text-gray-500">{t("map.warnings")}</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <Navigation className="text-blue-600 mx-auto mb-2" size={24} />
            <p className="text-lg font-bold text-gray-900">0.8km</p>
            <p className="text-xs text-gray-500">{t("map.toHotel")}</p>
          </div>
        </div>

        {/* Group Members */}
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