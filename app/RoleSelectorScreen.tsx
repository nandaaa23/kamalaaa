import {RoleSelectorScreen} from '../screens/RoleSelectorScreen';

export default function RoleSelector() {
  return <RoleSelectorScreen onSelectRole={(role) => console.log(role)} />;
}