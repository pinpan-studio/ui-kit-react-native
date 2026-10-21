/** Composants du kit (`lib/widgets` Flutter). Les écrans les utilisent plutôt que Paper brut. */
export { KitIconButton } from '../mobile/KitIconButton';
export { AvatarStack, KitAvatar } from './core/Avatars';
export { CountDot, StatusBadge } from './core/Badges';
export {
  KitButton,
  LineAction,
  type KitButtonProps,
  type KitButtonShape,
  type KitButtonSize,
  type KitButtonVariant,
} from './core/Button';
export { KitCard, KpiCard, TrendChip, type KitCardProps, type KpiCardProps } from './core/Card';
export { RoundIconButton, SplitButton, type SplitButtonItem } from './core/IconButtons';
export { KitProgressBar, LabeledDivider, PageHeader, ResponsiveGrid } from './core/Layout';
export { Skeleton, SkeletonListTile } from './core/Skeleton';
export { EmptyState, ErrorState } from './core/States';
export {
  FilterChipButton,
  KitChip,
  SegmentedToggle,
  ViewModeToggle,
  type SegmentOption,
  type ViewMode,
} from './core/Toggles';
export { MarkdownView, markdownInline } from './display/MarkdownView';
export { KitSlider } from './inputs/Slider';
export { FormFieldLabel, KitSearchBar, KitTextField, maskFormat, type KitTextFieldProps } from './inputs/TextField';
export {
  CopyField,
  CurrencyInput,
  NumberStepper,
  OtpInput,
  PasswordField,
  RatingInput,
  TagInput,
  passwordScore,
} from './fields/BasicFields';
export { MarkdownEditor, RichTextEditor } from './fields/Editors';
export { ColorPickerField, TransferList, TreeSelect, contrastOn, hexToHsv, hsvToHex, parseHex } from './fields/Pickers';
export { AddressField, SignaturePad } from './fields/Signature';
export { CheckboxTile, KitCheckbox, KitSwitch, RadioTile, SwitchTile, type CheckState } from './inputs/Choice';
export {
  DateField,
  DatePickerDialog,
  DateRangeDialog,
  DateRangeField,
  KitCalendar,
  TimeField,
  TimePickerDialog,
  type DateRange,
  type TimeOfDay,
} from './inputs/DateTime';
export {
  EntityAutocomplete,
  FieldTrigger,
  FilterDropdown,
  InputChip,
  MultiSelectField,
  SearchableSelect,
  SelectSheet,
  type SelectOption,
} from './inputs/Selects';
export { KitRangeSlider } from './inputs/Slider';
export { DEMO_FILES, DemoFilePicker, DropZone, FileUploadField, type DemoFile } from './inputs/Upload';
export { FormSheet, KitBottomSheet, KitDialog, SheetHeader, dialogIconDisc } from './overlays/Overlays';
