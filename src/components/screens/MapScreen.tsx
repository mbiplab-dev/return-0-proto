// =============================================================================
// UPDATED MAP SCREEN WITH NOTIFICATION INTEGRATION
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

const MapScreen: React.FC<MapScreenProps> = ({ groupMembers, mapContainer }) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const geojsonDataRef = useRef<any>(null);
  const { t } = useTranslation();

  // Helper function to create notification for hazard alert
  const createHazardNotification = async (hazardType: string, message: string, location?: any) => {
    try {
      const lngLat = markerRef.current?.getLngLat();
      const notificationLocation = location || (lngLat ? {
        type: 'Point',
        coordinates: [lngLat.lng, lngLat.lat] as [number, number],
        address: 'Current Location'
      } : undefined);

      await notificationService.handleMapHazardAlert(
        hazardType,
        message,
        notificationLocation
      );
    } catch (error) {
      console.error('Failed to create hazard notification:', error);
    }
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
        paint: { "fill-color": "#f08", "fill-opacity": 0.4 },
      });

      mapRef.current!.addLayer({
        id: "restricted-outline",
        type: "line",
        source: "restricted-areas",
        paint: { "line-color": "#c00", "line-width": 2 },
      });

      // ✅ Draggable marker
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([92.9376, 26.2006])
        .addTo(mapRef.current!);

      // ✅ Fetch hazards and add as circles
      const fetchHazards = async () => {
        try {
    const [sachetRes, landslideRes] = await Promise.all([
      fetch("/api/sachet"),
      fetch("/api/landslide"),
    ]);

    if (!sachetRes.ok || !landslideRes.ok) {
      throw new Error("Failed to fetch hazard APIs");
    }

    const [sachetData, landslideData] = await Promise.all([
      sachetRes.json(),
      landslideRes.json(),
    ]);

          const features: GeoJSON.Feature<GeoJSON.Geometry>[] = []; // Explicitly type features

          // Sachet alerts → 2km circles
          sachetData.forEach((a: any) => {
            if (!a.centroid) return;
            const [lon, lat] = a.centroid.split(",").map(Number);
            const circle = turf.circle([lon, lat], 2, {
              units: "kilometers",
              steps: 64,
            });
            features.push({
              type: "Feature",
              geometry: circle.geometry,
              properties: { ...a, type: "Sachet" },
            });
          });

          // Landslides → 2km circles
          landslideData.forEach((ls: any) => {
            if (!ls.lat || !ls.lon) return;
            const circle = turf.circle([ls.lon, ls.lat], 2, {
              units: "kilometers",
              steps: 64,
            });
            features.push({
              type: "Feature",
              geometry: circle.geometry,
              properties: { ...ls, type: "Landslide" },
            });
          });

          // Explicitly type hazardGeojson as GeoJSON.FeatureCollection
          const hazardGeojson: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features,
          };

          mapRef.current!.addSource("hazards", {
            type: "geojson",
            data: hazardGeojson,
          });

          // Rest of the layer code remains the same
          mapRef.current!.addLayer({
            id: "hazard-fill",
            type: "fill",
            source: "hazards",
            paint: {
              "fill-color": [
                "match",
                ["get", "type"],
                "Sachet",
                "#fbb03b",
                "Landslide",
                "#8B4513",
                "#888",
              ],
              "fill-opacity": 0.25,
            },
          });

          mapRef.current!.addLayer({
            id: "hazard-outline",
            type: "line",
            source: "hazards",
            paint: {
              "line-color": [
                "match",
                ["get", "type"],
                "Sachet",
                "#c88617",
                "Landslide",
                "#5a2f0e",
                "#444",
              ],
              "line-width": 2,
            },
          });

          geojsonDataRef.current.hazards = hazardGeojson;
        } catch (err) {
          console.error("Failed to fetch hazards:", err);
        }
      };
      await fetchHazards();

      // ✅ Marker dragend handler with notification creation
      markerRef.current!.on("dragend", async () => {
        const lngLat = markerRef.current!.getLngLat();
        const point = turf.point([lngLat.lng, lngLat.lat]);

        const hazardMessages: string[] = [];

        // Check restricted areas
        geojsonDataRef.current.features.forEach((feature: any) => {
          if (turf.booleanPointInPolygon(point, feature)) {
            const message = t('map.restrictedArea') + ": " + (feature.properties.name || "");
            hazardMessages.push(message);

            // Create notification for restricted area
            createHazardNotification(
              'restricted_area',
              `You have entered a restricted area: ${feature.properties.name || 'Unknown area'}. Please move to a safe location.`,
              {
                type: 'Point',
                coordinates: [lngLat.lng, lngLat.lat] as [number, number],
                address: feature.properties.name || 'Restricted Area'
              }
            );
          }
        });

        // Check hazard areas
        if (geojsonDataRef.current.hazards) {
          geojsonDataRef.current.hazards.features.forEach((feature: any) => {
            if (turf.booleanPointInPolygon(point, feature)) {
              const props = feature.properties;
              let hazardType = '';

              if (props.type === "Landslide") {
                hazardType = 'landslide';
                hazardMessages.push(
                  t('map.landslideAlert') +
                  ": " +
                  props.state + ", " +
                  props.district + ", " +
                  props.location + ", " +
                  props.status
                );

                // Create notification for landslide
                createHazardNotification(
                  hazardType,
                  `Landslide hazard detected at your location. Area: ${props.location}, ${props.district}, ${props.state}. Status: ${props.status}. Please avoid this area and move to safety.`,
                  {
                    type: 'Point',
                    coordinates: [lngLat.lng, lngLat.lat] as [number, number],
                    address: `${props.location}, ${props.district}, ${props.state}`
                  }
                );
              } else {
                hazardType = 'sachet';
                hazardMessages.push(
                  t('map.disasterAlert') +
                  ": " +
                  props.area_description +
                  ", " +
                  t('map.severity') +
                  ": " +
                  props.severity
                );

                // Create notification for sachet alert
                createHazardNotification(
                  hazardType,
                  `Disaster alert in your area: ${props.area_description}. Severity level: ${props.severity}. Please take necessary precautions.`,
                  {
                    type: 'Point',
                    coordinates: [lngLat.lng, lngLat.lat] as [number, number],
                    address: props.area_description || 'Alert Area'
                  }
                );
              }
            }
          });
        }

        // Display combined alert
        if (hazardMessages.length > 0) {
          toast.error(hazardMessages.join("\n"));
        } else {
          toast.success(t('map.safeZoneMessage'));
        }
      });

    });

    return () => mapRef.current?.remove();
  }, [t]);

  return (
    <div className="space-y-4">
      <Header
        title={t('map.liveMap')}
      />

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
              {t('map.recenter')}
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
            <p className="text-xs text-gray-500">{t('map.safe')}</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <AlertTriangle className="text-orange-600 mx-auto mb-2" size={24} />
            <p className="text-lg font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-500">{t('map.warnings')}</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <Navigation className="text-blue-600 mx-auto mb-2" size={24} />
            <p className="text-lg font-bold text-gray-900">0.8km</p>
            <p className="text-xs text-gray-500">{t('map.toHotel')}</p>
          </div>
        </div>

        {/* Group Members */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">{t('map.travelGroup')}</h3>
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