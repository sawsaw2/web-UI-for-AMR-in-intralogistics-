import React, { Component } from "react";
import paramConfig from "../scripts/paramConfig";
import ipConfig from "../scripts/ipConfig";

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ros: null,
      viewerInitialized: false, // New state property to check if the viewer has been initialized
    };
  }

  init_connection = () => {
    this.setState({ ros: new window.ROSLIB.Ros() }, () => {
      console.log("Map:" + this.state.ros);
      try {
        this.state.ros.connect(
          `ws://${ipConfig.ROSBRIDGE_SERVER_IPS}:${paramConfig.ROSBRIDGE_SERVER_PORT}`
        );
      } catch (error) {
        console.log("Connection error:", error);
        setTimeout(this.init_connection, 1000); // Try to reconnect after 1 second
      }
    });
  };

  view_map = () => {
    if (this.state.viewerInitialized) {
      // If viewer is already initialized, don't create a new one
      return;
    }
    const viewer = new window.ROS2D.Viewer({
      divID: "nav_div",
      width: 640,
      height: 480,
    });
    new window.NAV2D.OccupancyGridClientNav({
      ros: this.state.ros,
      rootObject: viewer.scene,
      viewer: viewer,
      serverName: "/move_base",
      withOrientation: true,
    });
    this.setState({ viewerInitialized: true }); // Set viewer as initialized
  };

  componentDidMount() {
    this.init_connection();
  }

  componentDidUpdate() {
    if (this.state.ros && !this.state.viewerInitialized) {
      this.view_map();
    }
  }

  render() {
    const mapContainerStyle = {
      background: "transparent",
    };

    return (
      <div>
        <h1>MAP</h1>
        <div id="nav_div" style={mapContainerStyle}></div>
      </div>
    );
  } 
}

export default Map;