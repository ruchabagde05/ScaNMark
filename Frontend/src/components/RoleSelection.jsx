import React from 'react';
import { Box, Button, styled } from '@mui/material';
import RoleIcon from './RoleIcon';

const RoleButton = styled(Button)`
  text-transform: none;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${(props) => (props.selected ? '#bdd3d2' : '#f2f5f9')};
  color: ${(props) => (props.selected ? '#fff' : '#000')};
  border: 1px solid ${(props) => (props.selected ? '#f2f5f9' : '#f2f5f9')};
  display: flex;
  justify-content: center;
  align-items: center;
  &:hover {
    background: #bdd3d2;
    color: #fff;
  }
`;

const RoleSelection = ({ selectedRole, handleRoleSelect, roles }) => (
  <Box display="flex" justifyContent="center" gap="10px" marginBottom="20px" flexWrap="wrap">
    {roles.map((role) => (
      <RoleButton
        key={role.name}
        selected={selectedRole === role.name}
        onClick={() => handleRoleSelect(role.name)}
      >
        <RoleIcon src={role.icon} alt={role.label} />
      </RoleButton>
    ))}
  </Box>
);

export default RoleSelection;
