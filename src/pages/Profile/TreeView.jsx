import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { useCenteredTree } from "./helpers";
import { Box, Typography, Avatar, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../middlewares/auth";


// Styling for the container
const containerStyles = {
  width: "100vw",
  height: "83vh",
};

// Custom node design for each employee
const Node = ({ nodeDatum, toggleNode, foreignObjectProps }) => {
  const { _id, name,position, status, department, avatar, phone, email, dob, role, subRole } = nodeDatum;
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Styling for the card content
  const cardStyle = {
    width: 280,
    boxShadow: isHovered ? "0px 8px 20px rgba(0, 0, 0, 0.1)" : "0px 2px 6px rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    padding: 2,
    backgroundColor: "white",
    transition: "all 0.3s ease-in-out",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
    cursor: "pointer",
    
  };

  // Styling for avatar
  const avatarStyle = {
    width: 90,
    height: 90,
    borderRadius: "50%",
    border: "3px solid #f1f1f1",
    boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.1)",
  };

  return (
    <g>
      <circle r={20} fill="green" onClick={toggleNode}></circle>
      <foreignObject {...foreignObjectProps} style={{ height: "350px", width: "250px", borderRadius: "20px" }}>
        <Link to={`/employee/${_id}`} style={{ textDecoration: "none" }}>
          <Box
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={cardStyle}
            component={motion.div} // Optional animation effect
            whileHover={{ scale: 1.05 }} // Optional animation effect
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Avatar
                src={avatar || "https://img.freepik.com/premium-vector/young-smiling-man-avatar-man-with-brown-beard-mustache-hair-wearing-yellow-sweater-sweatshirt-3d-vector-people-character-illustration-cartoon-minimal-style_365941-860.jpg"}
                alt={`${name}'s Avatar`}
                sx={avatarStyle}
              />
            </Box>
            <CardContent>
              <Typography variant="h6" sx={{ textAlign: "left", fontWeight: 600 }}>
                {name}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "left", color: "gray", fontStyle: "italic" }}>
                {role}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "left", color: "gray", fontStyle: "italic" }}>
                {position}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "left", color: "white", fontStyle: "italic", mb: 1 , backgroundColor: status === "active" ? "green" : "red", width: "fit-content", padding: "5px 10px", borderRadius: "5px"}}>
                {status || "Position not specified"}
              </Typography>

            </CardContent>
          </Box>
        </Link>
      </foreignObject>
    </g>
  );
};

const TreeView = ({ employee }) => {
    const [orgChart, setOrgChart] = useState(null);
    const [translate, containerRef] = useCenteredTree();
     const {user} = useAuth();
    useEffect(() => {
      const fetchEmployees = async () => {
        try {
          // Build hierarchical org chart structure
          const buildOrgChart = (employees, seniorIds, visited = new Set()) => {
            // Filter employees whose 'senior' array contains any of the seniorIds
            const filteredEmployees = employees.filter(
              (emp) => emp?.reportingManager === seniorIds
            );
  
            // Mark the current employees as visited
            filteredEmployees.forEach(emp => visited.add(emp._id));
  
            return filteredEmployees.map((emp) => ({
              _id: emp._id,
              name: emp.name,
              status: emp.status,
              position: emp.position,
              department: emp.department,
              avatar: emp.avatar,
              phone: emp.phone,
              email: emp.email,
              dob: emp.dob,
              role: emp.role,
              children: buildOrgChart(employees, emp._id, visited), // Recursively add children while passing visited set
            }));
          };
  
          // Corrected logic for filtering root nodes (e.g., CEO or superAdmin)
          let ceos = employee.filter(
            (emp) => emp.role === "superAdmin" || emp.role === "Admin"
          );

          if (ceos.length === 0) {
            ceos = [user];
          }
  
          // Build org chart for each root node (CEO or superAdmin)
          const orgCharts = ceos.map((ceo) => ({
            _id: ceo._id,
            name: ceo.name,
            status: ceo.status,
            position: ceo.position,
            department: ceo.department,
            avatar: ceo.avatar,
            phone: ceo.phone,
            email: ceo.email,
            dob: ceo.dob,
            role: ceo.role,
            children: buildOrgChart(employee, ceo._id),
          }));
  
          if (orgCharts.length > 0) {
            setOrgChart(orgCharts);
          } else {
            console.error("No root node (CEO or superAdmin) found in the data.");
          }
        } catch (err) {
          console.error("Error fetching employees:", err);
        }
      };
  
      fetchEmployees();
    }, [employee]);
  
    if (!orgChart) return null;
  
    return (
      <div style={containerStyles} ref={containerRef}>
<Tree
  data={orgChart}
  pathFunc={"Diagonal"}
  translate={translate}
  enableLegacyTransitions
  centeringTransitionDuration={1000}
  nodeSize={{ x: 500, y: 500 }}
  renderCustomNodeElement={(rd3tProps) => (
    <Node
      nodeDatum={rd3tProps.nodeDatum}
      toggleNode={rd3tProps.toggleNode}
      foreignObjectProps={{ width: 300, height: 250, x: 20 }}
      orientation="vertical" 
    />
  )}
  orientation="vertical"  
/>

      </div>
    );
  };
  
  export default TreeView;