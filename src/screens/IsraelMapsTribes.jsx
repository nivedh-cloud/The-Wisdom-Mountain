import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import tribesDataRaw from "../assets/data/israelTribesData.json";

// Fix for default marker icon issue in Leaflet with React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const mapConfig = tribesDataRaw.mapDimensions || {
  centerLat: 32.05,
  centerLng: 35.4,
  width: 450,
  height: 500,
  latRange: [30.8, 33.3],
  lngRange: [34.6, 36.2],
};

const IsraelMapsTribes = () => {
  const [tribes, setTribes] = useState([]);

  useEffect(() => {
    setTribes(tribesDataRaw.israelTribes || []);
  }, []);

  return (
    <div style={{ width: "100%", height: mapConfig.height, maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", margin: 8 }}>Tribes of Israel Map</h2>
      <MapContainer
        center={[mapConfig.centerLat, mapConfig.centerLng]}
        zoom={8}
        style={{ width: "100%", height: mapConfig.height }}
        minZoom={7}
        maxZoom={12}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {tribes.map((tribe) => (
          <Polygon
            key={tribe.id}
            positions={tribe.coordinates.boundaries}
            pathOptions={{ color: tribe.color, fillOpacity: 0.3, weight: 2 }}
          >
            <Tooltip direction="top" sticky>{tribe.name}</Tooltip>
            <Popup>
              <div>
                <h3 style={{ color: tribe.color }}>{tribe.name}</h3>
                <div><b>Territory:</b> {tribe.territory}</div>
                <div><b>Father:</b> {tribe.father} <b>Mother:</b> {tribe.mother}</div>
                <div style={{ marginTop: 6 }}>{tribe.description?.en}</div>
                <div style={{ marginTop: 6, fontStyle: "italic", color: "#666" }}>{tribe.blessings?.en}</div>
              </div>
            </Popup>
          </Polygon>
        ))}
        {tribes.map((tribe) => (
          <Marker
            key={tribe.id + "-marker"}
            position={[tribe.coordinates.centerLat, tribe.coordinates.centerLng]}
          >
            <Tooltip direction="bottom" offset={[0, 20]}>{tribe.name}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#888" }}>
        Hover or tap on a territory for details. Powered by Leaflet & OpenStreetMap.
      </div>
    </div>
  );
};

export default IsraelMapsTribes;
