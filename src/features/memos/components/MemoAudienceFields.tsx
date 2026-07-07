import { ChevronDown, CheckIcon, Search } from "lucide-react-native";
import { ActivityIndicator } from "react-native";

import {
  useDepartmentsQuery,
  useTargetableRoles,
  useTargetableUsersQuery,
} from "@/src/features/memos/hooks/useMemoTargeting";
import type { MemoTargetType } from "@/src/features/memos/types/CreateMemoTypes";
import type { MemoAudienceSelection } from "@/src/features/memos/utils/buildMemoTargetPayload";
import { Box } from "@/src/shared/components/ui/box";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/src/shared/components/ui/checkbox";
import {
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/shared/components/ui/form-control";
import { Input, InputField, InputSlot } from "@/src/shared/components/ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/src/shared/components/ui/select";
import { Text } from "@/src/shared/components/ui/text";
import { VStack } from "@/src/shared/components/ui/vstack";
import { formatRoleLabel } from "@/src/shared/rbac/role-rank";
import type { Role } from "@/src/shared/types";

const TARGET_OPTIONS: { label: string; value: MemoTargetType }[] = [
  { label: "Everyone at or below you", value: "broadcast" },
  { label: "By role", value: "role" },
  { label: "By department", value: "department" },
  { label: "Individuals", value: "individual" },
];

type MemoAudienceFieldsProps = {
  audience: MemoAudienceSelection;
  onChange: (audience: MemoAudienceSelection) => void;
  userSearch: string;
  onUserSearchChange: (value: string) => void;
};

function getOptionLabel<T extends string>(
  options: { label: string; value: T }[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function MemoAudienceFields({
  audience,
  onChange,
  userSearch,
  onUserSearchChange,
}: MemoAudienceFieldsProps) {
  const targetableRoles = useTargetableRoles();
  const departmentsQuery = useDepartmentsQuery(
    audience.targetType === "department",
  );
  const usersQuery = useTargetableUsersQuery(
    userSearch,
    audience.targetType === "individual",
  );

  const updateAudience = (patch: Partial<MemoAudienceSelection>) => {
    onChange({ ...audience, ...patch });
  };

  const toggleRole = (role: Role) => {
    const selected = audience.selectedRoles.includes(role)
      ? audience.selectedRoles.filter((item) => item !== role)
      : [...audience.selectedRoles, role];

    updateAudience({ selectedRoles: selected });
  };

  const toggleDepartment = (departmentId: string) => {
    const selected = audience.selectedDepartmentIds.includes(departmentId)
      ? audience.selectedDepartmentIds.filter((item) => item !== departmentId)
      : [...audience.selectedDepartmentIds, departmentId];

    updateAudience({ selectedDepartmentIds: selected });
  };

  const toggleUser = (userId: string) => {
    const selected = audience.selectedUserIds.includes(userId)
      ? audience.selectedUserIds.filter((item) => item !== userId)
      : [...audience.selectedUserIds, userId];

    updateAudience({ selectedUserIds: selected });
  };

  return (
    <VStack className="gap-4">
      <FormControl>
        <FormControlLabel>
          <FormControlLabelText className="text-sm font-semibold">
            Audience
          </FormControlLabelText>
        </FormControlLabel>
        <Select
          selectedValue={audience.targetType}
          onValueChange={(value) =>
            updateAudience({
              targetType: value as MemoTargetType,
              selectedRoles: [],
              selectedDepartmentIds: [],
              selectedUserIds: [],
            })
          }
        >
          <SelectTrigger className="h-12 rounded-lg bg-card">
            <SelectInput
              value={getOptionLabel(TARGET_OPTIONS, audience.targetType)}
              editable={false}
              className="flex-1"
            />
            <SelectIcon className="mr-3" as={ChevronDown} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {TARGET_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>
        <FormControlHelper>
          <FormControlHelperText>
            You can only target roles at or below your own rank.
          </FormControlHelperText>
        </FormControlHelper>
      </FormControl>

      {audience.targetType === "broadcast" ? (
        <Box className="rounded-lg border border-border bg-card px-4 py-3">
          <Text className="text-sm text-muted-foreground">
            This memo will reach everyone at or below your rank:{" "}
            <Text className="font-semibold text-foreground">
              {targetableRoles.map(formatRoleLabel).join(", ")}
            </Text>
          </Text>
        </Box>
      ) : null}

      {audience.targetType === "role" ? (
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-sm font-semibold">
              Select roles
            </FormControlLabelText>
          </FormControlLabel>
          <VStack className="gap-2 rounded-lg border border-border bg-card px-4 py-3">
            {targetableRoles.map((role) => (
              <Checkbox
                key={role}
                value={role}
                isChecked={audience.selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel>{formatRoleLabel(role)}</CheckboxLabel>
              </Checkbox>
            ))}
          </VStack>
        </FormControl>
      ) : null}

      {audience.targetType === "department" ? (
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-sm font-semibold">
              Select departments
            </FormControlLabelText>
          </FormControlLabel>
          {departmentsQuery.isLoading ? (
            <Box className="items-center py-4">
              <ActivityIndicator />
            </Box>
          ) : departmentsQuery.isError ? (
            <Text className="text-sm text-destructive">
              Could not load departments.
            </Text>
          ) : (departmentsQuery.data?.length ?? 0) === 0 ? (
            <Text className="text-sm text-muted-foreground">
              No departments available.
            </Text>
          ) : (
            <VStack className="gap-2 rounded-lg border border-border bg-card px-4 py-3">
              {departmentsQuery.data?.map((department) => (
                <Checkbox
                  key={department.id}
                  value={department.id}
                  isChecked={audience.selectedDepartmentIds.includes(
                    department.id,
                  )}
                  onChange={() => toggleDepartment(department.id)}
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>
                    {department.name}
                    {department.code ? ` (${department.code})` : ""}
                  </CheckboxLabel>
                </Checkbox>
              ))}
            </VStack>
          )}
        </FormControl>
      ) : null}

      {audience.targetType === "individual" ? (
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-sm font-semibold">
              Select people
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="mb-3 h-11 rounded-lg border-border bg-card">
            <InputSlot className="pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </InputSlot>
            <InputField
              placeholder="Search by name or email"
              value={userSearch}
              onChangeText={onUserSearchChange}
              accessibilityLabel="Search people"
              className="px-2 text-sm text-foreground"
            />
          </Input>
          {usersQuery.isLoading ? (
            <Box className="items-center py-4">
              <ActivityIndicator />
            </Box>
          ) : usersQuery.isError ? (
            <Text className="text-sm text-destructive">
              Could not load people.
            </Text>
          ) : (usersQuery.data?.length ?? 0) === 0 ? (
            <Text className="text-sm text-muted-foreground">
              No matching people at or below your rank.
            </Text>
          ) : (
            <VStack className="gap-2 rounded-lg border border-border bg-card px-4 py-3">
              {usersQuery.data?.map((person) => (
                <Checkbox
                  key={person.id}
                  value={person.id}
                  isChecked={audience.selectedUserIds.includes(person.id)}
                  onChange={() => toggleUser(person.id)}
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <VStack>
                    <CheckboxLabel>
                      {person.firstName} {person.lastName}
                    </CheckboxLabel>
                    <Text className="text-xs text-muted-foreground">
                      {formatRoleLabel(person.role)} · {person.email}
                    </Text>
                  </VStack>
                </Checkbox>
              ))}
            </VStack>
          )}
        </FormControl>
      ) : null}
    </VStack>
  );
}
