import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, LayersControl, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams } from 'react-router-dom';
import Loading from '../../../../public/Loading/Index.jsx';


const adjustTime = (time) => {
  const date = new Date(time);
  date.setHours(date.getHours() - 5);
  date.setMinutes(date.getMinutes() - 30);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const isValidLatLng = (lat, lng) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  return !isNaN(parsedLat) && !isNaN(parsedLng) && parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180;
};

const fetchPlaceName = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    if (data?.address) {
      const address = data.address;
      const street = address.road || address.street || address.village || '';
      const housenumber = address.house_number || '';
      const neighborhood = address.neighbourhood || address.suburb || address.locality || '';
      const city = address.city || address.town || address.village || address.county || '';
      const state = address.state || address.region || '';
      let placeName = '';
      if (street) placeName += `${street}${housenumber ? ' ' + housenumber : ''}`;
      if (neighborhood && neighborhood !== street) placeName += `${placeName ? ', ' : ''}${neighborhood}`;
      if (city && city !== neighborhood) placeName += `${placeName ? ', ' : ''}${city}`;
      if (!placeName && state) placeName = state;
      return placeName || data.display_name || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Error fetching place name:', error);
    return 'Unknown Location';
  }
};

const precomputeData = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates)) return [];
  
  const normalized = coordinates
    .filter(point => point && isValidLatLng(point.latitude, point.longitude))
    .map(point => ({
      latitude: parseFloat(point.latitude),
      longitude: parseFloat(point.longitude),
      timelapse: point.timelapse,
    }));

  let totalDistance = 0;
  return normalized.map((point, i) => {
    let distance = 0;
    let isRestPoint = false;
    if (i > 0) {
      const prev = normalized[i - 1];
      const latlng1 = L.latLng(prev.latitude, prev.longitude);
      const latlng2 = L.latLng(point.latitude, point.longitude);
      distance = latlng1.distanceTo(latlng2);
      totalDistance += distance;
      const timeDiff = (new Date(point.timelapse) - new Date(prev.timelapse)) / 1000 / 60;
      isRestPoint = timeDiff > 5;
    }
    return { ...point, distance: totalDistance, isRestPoint };
  });
};

const EmployeeLocation = ({ selectedDate, isLoading, data }) => {
  const { id } = useParams();
  const [mapData, setMapData] = useState({ path: [], meetings: [] });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [locationNames, setLocationNames] = useState({});
  const [mapZoom, setMapZoom] = useState(13);

  const processData = useCallback(async (rawData) => {
    setIsDataLoading(true);
    const coordinates = rawData?.data?.data?.coordinates || [];
    const meetings = rawData?.data?.data?.meetingData || [];

    const path = precomputeData(coordinates);
    const meetingData = meetings
      .filter(meeting => meeting?.coordinates && isValidLatLng(meeting.coordinates.latitude, meeting.coordinates.longitude))
      .map(meeting => ({
        latitude: parseFloat(meeting.coordinates.latitude),
        longitude: parseFloat(meeting.coordinates.longitude),
        timelapse: meeting.coordinates.timelapse,
        leadId: meeting.leadId,
        leadName: meeting.leadName,
      }));

    setMapData({ path, meetings: meetingData });

    const keyPoints = [
      path[0],
      path[path.length - 1],
      ...meetingData,
      ...path.filter(p => p.isRestPoint),
    ].filter(Boolean);

    const placePromises = keyPoints.map(point =>
      fetchPlaceName(point.latitude, point.longitude).then(name => ({
        lat: point.latitude,
        lng: point.longitude,
        name,
      }))
    );

    const placeResults = await Promise.all(placePromises);
    const newLocationNames = placeResults.reduce((acc, { lat, lng, name }) => {
      acc[`${lat},${lng}`] = name;
      return acc;
    }, {});

    setLocationNames(newLocationNames);
    setIsDataLoading(false);
  }, []);

  useEffect(() => {
    if (data) processData(data);
  }, [data, processData]);

  const MapUpdater = ({ path }) => {
    const map = useMap();
    useEffect(() => {
      if (path?.length > 0) {
        const bounds = path.map(p => [p.latitude, p.longitude]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
      }
    }, [path, map]);
    return null;
  };

  const { path, meetings } = mapData;
  const currentLocationName = locationNames[`${path[path.length - 1]?.latitude},${path[path.length - 1]?.longitude}`] || 'Fetching...';

  const pathMarkers = useMemo(() => {
    return path.map((point, index) => {
      if (index === 0 || index === path.length - 1 || point.isRestPoint) {
        const locName = index === path.length - 1 ? currentLocationName : locationNames[`${point.latitude},${point.longitude}`];
        const label = index === 0 ? 'Start' : index === path.length - 1 ? 'Last Location' : 'Rest';
        return (
          <Marker
            key={index}
            position={[point.latitude, point.longitude]}
            icon={createEnhancedIcon(label)}
          >
            <LeafletTooltip
              direction="top"
              offset={[0, -50]}
              permanent={false}
              opacity={1}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #f4f7fa)',
                  borderRadius: '12px',
                  padding: '15px',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e0e6ed',
                  maxWidth: '300px',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                <h6
                  style={{
                    fontWeight: 600,
                    color: '#2c3e50',
                    borderBottom: `2px solid ${
                      label === 'Start' ? '#0984e3' : label === 'Last Location' ? '#00b894' : '#d63031'
                    }`,
                    paddingBottom: '8px',
                    margin: '0 0 10px 0',
                  }}
                >
                  {label}
                </h6>
                <p style={{ color: '#34495e', margin: '5px 0' }}>
                  <strong>Time:</strong> {adjustTime(point.timelapse)}
                </p>
                <p style={{ color: '#34495e', margin: '5px 0' }}>
                  <strong>Distance:</strong> {Math.round(point.distance / 1000)} km
                </p>
                <p style={{ color: '#34495e', margin: '5px 0' }}>
                  <strong>Location:</strong> {locName}
                </p>
              </div>
            </LeafletTooltip>
          </Marker>
        );
      }
      return null;
    });
  }, [path, locationNames, currentLocationName]);

  const meetingMarkers = useMemo(() => {
    return meetings.map((meeting, index) => (
      <Marker
        key={`meeting-${index}`}
        position={[meeting.latitude, meeting.longitude]}
        icon={createEnhancedIcon('Meeting')}
      >
        <LeafletTooltip
          direction="top"
          offset={[0, -50]}
          permanent={false}
          opacity={1}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff, #f4f7fa)',
              borderRadius: '12px',
              padding: '15px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e0e6ed',
              maxWidth: '300px',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <h6
              style={{
                fontWeight: 600,
                color: '#2c3e50',
                borderBottom: '2px solid #fdcb6e',
                paddingBottom: '8px',
                margin: '0 0 10px 0',
              }}
            >
              Meeting
            </h6>
            <p style={{ color: '#34495e', margin: '5px 0' }}>
              <strong>Time:</strong> {adjustTime(meeting.timelapse)}
            </p>
            <p style={{ color: '#34495e', margin: '5px 0' }}>
              <strong>Lead:</strong> {meeting.leadName}
            </p>
            <p style={{ color: '#34495e', margin: '5px 0' }}>
              <strong>Location:</strong> {locationNames[`${meeting.latitude},${meeting.longitude}`]}
            </p>
          </div>
        </LeafletTooltip>
      </Marker>
    ));
  }, [meetings, locationNames]);

  return (
    <div style={{ position: 'relative', width: '100%', maxHeight:'70vh', backgroundColor: '#f4f7fa', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
      <MapContainer
        center={path.length > 0 ? [path[path.length - 1].latitude, path[path.length - 1].longitude] : [0, 0]}
        zoom={mapZoom}
        style={{ height: '100vh', width: '100%', zIndex: 11 }}
      >
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Default">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://opentopomap.org">OpenTopoMap</a>'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png"
              attribution='© <a href="http://stamen.com">Stamen Design</a>'
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <MapUpdater path={path} />
        {path.length > 1 && (
          <Polyline
            positions={path.map(p => [p.latitude, p.longitude])}
            pathOptions={{ color: '#3076e6' , weight: 5 }}
          />
        )}
        {pathMarkers}
        {meetingMarkers}
      </MapContainer>

      {(isLoading || isDataLoading) && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loading />
            <p style={{ marginTop: '15px', color: '#34495e', fontFamily: 'Poppins, sans-serif', fontWeight: '500' }}>Loading Route Data...</p>
          </div>
        </div>
      )}

      {!isDataLoading && (
        <>

      
          <div style={{ position: 'absolute', top: '250px', right: '20px', width: '300px', maxHeight: '50vh', background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', padding: '25px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', overflowY: 'auto', fontFamily: 'Poppins, sans-serif', zIndex: 99999, border: '1px solid #e0e6ed' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: '600', color: '#2c3e50', textTransform: 'uppercase', letterSpacing: '1.2px', borderBottom: '3px solid #00b894', paddingBottom: '10px' }}>Timeline</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {path.map((point, index) => (
                (index === 0 || index === path.length - 1 || point.isRestPoint) && (
                  <li key={index} style={{ padding: '15px', borderBottom: '1px solid #e0e6ed', color: '#7f8c8d', cursor: 'pointer', fontSize: '15px', lineHeight: '1.8', background: index % 2 === 0 ? '#f9fafc' : '#fff', borderRadius: '10px', marginBottom: '10px' }}>
                    <strong style={{ color: '#2c3e50', fontWeight: '600' }}>{index === 0 ? 'Start' : index === path.length - 1 ? 'Last Location' : 'Rest'}</strong> - {adjustTime(point.timelapse)}<br />
                    <small style={{ color: '#95a5a6' }}>Distance: {Math.round(point.distance / 1000)} km</small>
                  </li>
                )
              ))}
              {meetings.map((meeting, index) => (
                <li key={`meeting-${index}`} style={{ padding: '15px', borderBottom: '1px solid #e0e6ed', color: '#d63031', cursor: 'pointer', fontSize: '15px', lineHeight: '1.8', background: '#fff', borderRadius: '10px', marginBottom: '10px' }}>
                  <strong style={{ color: '#d63031', fontWeight: '600' }}>Meeting</strong> - {adjustTime(meeting.timelapse)}<br />
                  <small style={{ color: '#95a5a6' }}>Lead: {meeting.leadName}</small>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ position: 'absolute', top: '20px', right: '20px', width: '300px', maxHeight: '40vh', overflow: 'auto', background: 'rgba(255, 255, 255, 0.95)', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)', fontFamily: 'Poppins, sans-serif', zIndex: 9999999, border: '1px solid #e0e6ed' }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '20px', color: '#2c3e50', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Route Summary</h3>
            <p style={{ margin: '10px 0', color: '#7f8c8d', fontSize: '15px', lineHeight: '1.6' }}><span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Distance:</span> <strong>{Math.round(path[path.length - 1]?.distance / 1000 || 0)} km</strong></p>
            <p style={{ margin: '10px 0', color: '##7f8c8d', fontSize: '15px', lineHeight: '1.6' }}><span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Rest Stops:</span> <strong>{path.filter(p => p.isRestPoint).length}</strong> | <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Meetings:</span> <strong>{meetings.length}</strong></p>
            <p style={{ margin: '10px 0', color: '#7f8c8d', fontSize: '15px', lineHeight: '1.6' }}><span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Last Location:</span> <strong>{currentLocationName}</strong></p>
          </div>
        </>
      )}
    </div>
  );
};

const createEnhancedIcon = (label) => {
  let html;
  switch (label) {
    case 'Start':
      html = `
        <div style="position: relative; width: 30px; height: 45px; transform: translateX(-50%);">
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 24px;
            height: 36px;
            background: linear-gradient(135deg, #0984e3, #0652dd);
            border-radius: 12px 12px 0 0;
            clip-path: polygon(50% 100%, 0 0, 100% 0);
            transform: translateX(-50%);
            animation: pulse 1.8s infinite ease-in-out;
            box-shadow: 0 4px 15px rgba(9, 132, 227, 0.8);
          "></div>
          <div style="
            position: absolute;
            bottom: -2px;
            left: 50%;
            width: 12px;
            height: 12px;
            background: rgba(9, 132, 227, 0.5);
            border-radius: 50%;
            transform: translateX(-50%);
            animation: glow 1.8s infinite ease-in-out;
          "></div>
          <div style="
            position: absolute;
            top: 6px;
            left: 50%;
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 50%;
            transform: translateX(-50%);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
          "></div>
        </div>
        <style>
          @keyframes pulse { 0% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } 100% { transform: translateX(-50%) scale(1); } }
          @keyframes glow { 0% { transform: translateX(-50%) scale(1); opacity: 0.5; } 50% { transform: translateX(-50%) scale(1.3); opacity: 0.8; } 100% { transform: translateX(-50%) scale(1); opacity: 0.5; } }
        </style>
      `;
      break;

    case 'Last Location':
      html = `
        <div style="position: relative; width: 40px; height: 60px; transform: translateX(-50%);">
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 30px;
            height: 45px;
            background: linear-gradient(135deg, #00b894, #00cec9);
            border-radius: 15px 15px 0 0;
            clip-path: polygon(50% 100%, 0 0, 100% 0);
            transform: translateX(-50%);
            animation: pulse 1.5s infinite ease-in-out;
            box-shadow: 0 6px 20px rgba(0, 184, 148, 0.8);
          "></div>
          <div style="
            position: absolute;
            bottom: -3px;
            left: 50%;
            width: 15px;
            height: 15px;
            background: rgba(0, 184, 148, 0.6);
            border-radius: 50%;
            transform: translateX(-50%);
            animation: glow 1.5s infinite ease-in-out;
          "></div>
          <div style="
            position: absolute;
            top: 8px;
            left: 50%;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 50%;
            transform: translateX(-50%);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
            animation: blink 1s infinite alternate;
          "></div>
        </div>
        <style>
          @keyframes pulse { 0% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.15); } 100% { transform: translateX(-50%) scale(1); } }
          @keyframes glow { 0% { transform: translateX(-50%) scale(1); opacity: 0.6; } 50% { transform: translateX(-50%) scale(1.4); opacity: 0.9; } 100% { transform: translateX(-50%) scale(1); opacity: 0.6; } }
          @keyframes blink { 0% { opacity: 1; } 100% { opacity: 0.5; } }
        </style>
      `;
      break;

    case 'Meeting':
      html = `
        <div style="position: relative; width: 35px; height: 50px; transform: translateX(-50%);">
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 26px;
            height: 38px;
            background: linear-gradient(135deg, #fdcb6e, #f39c12);
            border-radius: 50% 50% 0 0;
            clip-path: polygon(50% 100%, 20% 0, 80% 0);
            transform: translateX(-50%);
            animation: pulse 1.6s infinite ease-in-out;
            box-shadow: 0 5px 18px rgba(253, 203, 110, 0.8);
          "></div>
          <div style="
            position: absolute;
            bottom: -2px;
            left: 50%;
            width: 14px;
            height: 14px;
            background: rgba(253, 203, 110, 0.5);
            border-radius: 50%;
            transform: translateX(-50%);
            animation: glow 1.6s infinite ease-in-out;
          "></div>
          <div style="
            position: absolute;
            top: 6px;
            left: 50%;
            width: 10px;
            height: 10px;
            background: #fff;
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            transform: translateX(-50%);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
          "></div>
        </div>
        <style>
          @keyframes pulse { 0% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.12); } 100% { transform: translateX(-50%) scale(1); } }
          @keyframes glow { 0% { transform: translateX(-50%) scale(1); opacity: 0.5; } 50% { transform: translateX(-50%) scale(1.3); opacity: 0.8; } 100% { transform: translateX(-50%) scale(1); opacity: 0.5; } }
        </style>
      `;
      break;

    case 'Rest':
      html = `
        <div style="position: relative; width: 32px; height: 48px; transform: translateX(-50%);">
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 25px;
            height: 40px;
            background: linear-gradient(135deg, #d63031, #e17055);
            border-radius: 10px 10px 0 0;
            clip-path: polygon(50% 100%, 10% 10%, 90% 10%);
            transform: translateX(-50%);
            animation: pulse 1.7s infinite ease-in-out;
            box-shadow: 0 5px 18px rgba(214, 48, 49, 0.8);
          "></div>
          <div style="
            position: absolute;
            bottom: -2px;
            left: 50%;
            width: 13px;
            height: 13px;
            background: rgba(214, 48, 49, 0.5);
            border-radius: 50%;
            transform: translateX(-50%);
            animation: glow 1.7s infinite ease-in-out;
          "></div>
          <div style="
            position: absolute;
            top: 8px;
            left: 50%;
            width: 12px;
            height: 12px;
            background: #fff;
            border-radius: 2px;
            transform: translateX(-50%) rotate(45deg);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.9);
          "></div>
        </div>
        <style>
          @keyframes pulse { 0% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } 100% { transform: translateX(-50%) scale(1); } }
          @keyframes glow { 0% { transform: translateX(-50%) scale(1); opacity: 0.5; } 50% { transform: translateX(-50%) scale(1.3); opacity: 0.8; } 100% { transform: translateX(-50%) scale(1); opacity: 0.5; } }
        </style>
      `;
      break;

    default:
      html = `<div></div>`;
  }

  return new L.DivIcon({
    html,
    className: 'enhanced-marker',
    iconSize: [40, 60],
    iconAnchor: [20, 60],
  });
};

export default EmployeeLocation;