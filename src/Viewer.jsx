import React, { useEffect, useRef, useState } from "react";

// Our wonderful chair model
const MODEL_UID = "f4e8761bf64f488095ee57f2cb5698c4";
// const MODEL_UID = '2bee60e4ed7e4680b56c718bc52c51e7';
// const MODEL_UID = '034a1a146e304161b7c45b9354ed2dfd';

const useSketchfabViewer = () => {
  // This ref will contain the actual iframe object
  const viewerIframeRef = useRef(null);
  const [api, setApi] = useState();

  const ViewerIframe = (
    <iframe
      // We feed the ref to the iframe component to get the underlying DOM object
      ref={viewerIframeRef}
      title="sketchfab-viewer"
      style={{ height: 400, width: 600 }}
    />
  );

  useEffect(
    () => {
      // Initialize the viewer
      let client = new window.Sketchfab(viewerIframeRef.current);
      client.init(MODEL_UID, {
        success: setApi,
        error: () => {
          console.log("Viewer error");
        },
      });
    },
    // We only want to initialize the viewer on first load
    // so we don't add any dependencies to useEffect
    []
  );

  return [ViewerIframe, api];
};

export const Viewer = ({ apiRef }) => {
  const [ViewerIframe, api] = useSketchfabViewer();

  apiRef.current = api;

  return ViewerIframe;
};
