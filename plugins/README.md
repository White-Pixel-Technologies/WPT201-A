# Expo Config Plugins

This folder contains custom Expo configuration plugins used by the project.

## Guidelines

- Keep each plugin focused on a specific configuration task.
- Document why the plugin is needed and what it does.
- Avoid duplicating functionality already provided by Expo.
- Test plugin changes on supported platforms.

## backup-off

### Purpose

The backup-off plugin disables Android app backup to protect user data and prevent unauthorized data extraction.

### Functionality

- Disables Android backup using `android:allowBackup="false"`.
- Configures Android 9–11 backup rules to exclude app data from cloud backup.
- Configures Android 12 and above data extraction rules to exclude app data from cloud backup and device-to-device transfer.
- Registers the plugin through `app.config.ts`.

### Verification

After running Expo prebuild, verify the following files:

- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/xml/backup_rules.xml`
- `android/app/src/main/res/xml/data_extraction_rules.xml`

The generated Android configuration should disable backup and exclude app data from backup and transfer.