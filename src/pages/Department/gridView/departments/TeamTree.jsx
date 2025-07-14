import React, { useEffect, useState } from "react";
import Tree from "react-d3-tree";
import { useCenteredTree } from "../../../Profile/helpers";
import { Box, Typography, Avatar, Card, CardContent, IconButton, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../middlewares/auth";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const containerStyles = {
  width: "100vw",
  height: "100vh",
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
};

const Node = ({ nodeDatum, toggleNode, foreignObjectProps, open }) => {
  const theme = useTheme();
  const { teamId, _id, name, position, status, avatar, role } = nodeDatum || {}; // Fallback for undefined nodeDatum
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    width: 250,
    height: 320,
    boxShadow: theme.shadows[4],
    borderRadius: "16px",
    padding: 2,
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(8px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isHovered ? "translateY(-8px)" : "translateY(0)",
    cursor: "pointer",
    position: "relative",
    overflow: "visible",
    '&:hover': {
      boxShadow: theme.shadows[6],
    },
  };

  const avatarStyle = {
    width: 64,
    height: 64,
    border: `3px solid ${theme.palette.primary.main}`,
    boxShadow: theme.shadows[2],
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  };

  const statusStyle = {
    position: "absolute",
    top: 16,
    right: 16,
    display: "flex",
    alignItems: "center",
    gap: 1,
    padding: "4px 8px",
    borderRadius: "12px",
    background: status === "active" ? "rgba(76, 175, 80, 0.15)" : "rgba(244, 67, 54, 0.15)",
    color: status === "active" ? theme.palette.success.dark : theme.palette.error.dark,
    fontSize: "0.75rem",
    fontWeight: 600,
  };

  return (
    <g>
      <foreignObject {...foreignObjectProps} style={{ ...foreignObjectProps.style, overflow: "visible" }}>
        <Box
          component={motion.div}
          whileHover={{ scale: 1.02 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {teamId && (
            <IconButton 
              onClick={() => open(teamId)}
              sx={{
                position: "absolute",
                top: -100,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  transform: "translateX(-50%) scale(1.1)",
                },
              }}
            >
              <AddCircleIcon sx={{ fill: "white", fontSize: "4rem" }} />
            </IconButton>
          )}
          
          <Card sx={cardStyle}>
            <Box sx={statusStyle}>
              <FiberManualRecordIcon sx={{ fontSize: "0.75rem" }} />
              {status?.toUpperCase() || "UNKNOWN"}
            </Box>
            
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 6 }}>
              <Avatar
                src={avatar}
                sx={{
                  ...avatarStyle,
                  transform: isHovered ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.3s ease",
                }}
                component={motion.div}
                whileHover={{ rotate: 5 }}
              />
              
              <CardContent sx={{ textAlign: "center", pt: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {name || "Unnamed"}
                </Typography>
                
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  mt: 1,
                }}>
                  {role || "N/A"}
                </Typography>
                
                <Typography variant="caption" sx={{
                  display: "inline-block",
                  color: theme.palette.primary.main,
                  backgroundColor: "rgba(63, 81, 181, 0.1)",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "8px",
                  mt: 1,
                  fontWeight: 600,
                }}>
                  {position || "N/A"}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        </Box>
      </foreignObject>
    </g>
  );
};

const TeamTreeChart = ({ team = {}, employee = [], open }) => {
  const [orgChart, setOrgChart] = useState(null);
  const [translate, containerRef] = useCenteredTree();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const buildOrgChart = (employees, teamId, visited = new Set()) => {
      if (!teamId || !employees?.length) return [];
      return employees
        .filter(emp => team?.teamMembers?.includes(emp._id) && !visited.has(emp._id))
        .map(emp => {
          visited.add(emp._id);
          return {
            ...emp,
            teamId: team?._id,
            children: buildOrgChart(employees, emp._id, visited),
          };
        });
    };

    const createChart = () => {
      try {
        const ceos = team?.teamLead
          ? employee.filter(emp => emp._id === team.teamLead)
          : []; // Only use employee data for team lead
        if (ceos.length === 0 && user) {
          console.warn("No team lead found, falling back to current user:", user);
          ceos.push({ ...user, teamId: team?._id });
        }
        return ceos.map(ceo => ({
          ...ceo,
          teamId: team?._id,
          children: buildOrgChart(employee, team?._id),
        }));
      } catch (err) {
        console.error("Error building org chart:", err);
        return [];
      }
    };

    setOrgChart(createChart());
  }, [employee, team, user]);

  if (!orgChart || orgChart.length === 0) {
    return (
      <Box sx={containerStyles} ref={containerRef}>
        <Typography sx={{ textAlign: "center", padding: "2rem", color: theme.palette.text.secondary }}>
          No organizational chart data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={containerStyles} ref={containerRef}>
      <Tree
        data={orgChart}
        pathFunc="Diagonal"
        translate={translate}
        nodeSize={{ x: 300, y: 350 }}
        separation={{ siblings: 1.5, nonSiblings: 1.5 }}
        enableLegacyTransitions
        orientation="vertical"
        renderCustomNodeElement={(rd3tProps) => (
          <Node
            {...rd3tProps}
            foreignObjectProps={{
              width: 240,
              height: 280,
              x: -120,
              y: -140,
            }}
            open={open}
          />
        )}
        styles={{
          links: {
            stroke: theme.palette.primary.light,
            strokeWidth: 2,
            strokeLinecap: "round",
          },
        }}
      />
    </Box>
  );
};

export default TeamTreeChart;