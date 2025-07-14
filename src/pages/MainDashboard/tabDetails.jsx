import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Fade,
  Grid,
  Paper,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  useTheme
} from '@mui/material';
import TeamMember from '../Profile/subComponents/teamMember';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import WorkIcon from '@mui/icons-material/Work';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Fade in={value === index} timeout={500}>
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
};

const TeamTabs = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Sample data for leads
  const leads = [
    { id: 1, name: 'Michael Brown', position: 'Technical Lead', avatar: null },
    { id: 2, name: 'Sarah Davis', position: 'Project Manager', avatar: null },
  ];

  // Sample data for projects
  const projects = [
    { id: 1, name: 'Project Alpha', status: 'In Progress', members: 5 },
    { id: 2, name: 'Project Beta', status: 'Planning', members: 3 },
    { id: 3, name: 'Project Gamma', status: 'Completed', members: 4 },
  ];

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return theme.palette.info.main;
      case 'Planning': return theme.palette.warning.main;
      case 'Completed': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%', 
        borderRadius: 2, 
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden',
        height: '45vh',
        borderTop: `3px solid ${theme.palette.primary.main}`,
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{
          backgroundColor: theme.palette.background.default,
          '& .MuiTab-root': {
            minHeight: 64,
            fontWeight: 500,
            transition: 'all 0.3s',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(69, 114, 237, 0.04)' 
                : 'rgba(209, 105, 178, 0.04)',
            }
          },
          '& .Mui-selected': {
            backgroundColor: theme.palette.mode === 'light' 
              ? 'rgba(69, 114, 237, 0.08)' 
              : 'rgba(209, 105, 178, 0.08)',
          },
        }}
      >
        <Tab 
          icon={<PersonIcon />} 
          label="Team Members" 
          iconPosition="start"
        />
        <Tab 
          icon={<SupervisorAccountIcon />} 
          label="Leads" 
          iconPosition="start"
        />
        <Tab 
          icon={<WorkIcon />} 
          label="Projects" 
          iconPosition="start"
        />
      </Tabs>
      
      <Box sx={{ height: 'calc(45vh - 64px)', overflow: 'auto' }}>
        <TabPanel value={value} index={0}>
          <TeamMember />
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {leads.map((lead) => (
              <React.Fragment key={lead.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {lead.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={lead.name}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {lead.position}
                      </Typography>
                    }
                  />
                </ListItem>
                {lead.id !== leads.length && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <Grid container spacing={2}>
            {projects.map((project) => (
              <Grid item xs={12} key={project.id}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: theme.palette.mode === 'light' ? 1 : 0,
                    border: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
                    borderLeft: `4px solid ${getStatusColor(project.status)}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {project.name}
                    </Typography>
                    <Chip 
                      label={project.status} 
                      size="small"
                      sx={{ 
                        backgroundColor: getStatusColor(project.status),
                        color: '#fff',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" color="text.secondary">
                      {project.members} team members
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default TeamTabs;