/// <reference types="node" />
import {
  ConfigPlugin,
  withAndroidManifest,
  withDangerousMod,
} from '@expo/config-plugins';

import fs from 'fs';
import path from 'path';

const withBackupOff: ConfigPlugin = (config) => {
  // Disable Android backup in AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (!mainApplication) {
      throw new Error('Android application element not found');
    }

    mainApplication.$['android:allowBackup'] = 'false';
    mainApplication.$['android:fullBackupContent'] = '@xml/backup_rules';
    mainApplication.$['android:dataExtractionRules'] =
      '@xml/data_extraction_rules';

    return config;
  });

  // Generate Android backup exclusion XML files
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.platformProjectRoot;

      const xmlDirectory = path.join(
        projectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml',
      );

      fs.mkdirSync(xmlDirectory, { recursive: true });

      const backupRules = `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <exclude domain="root" path="." />
    <exclude domain="file" path="." />
    <exclude domain="database" path="." />
    <exclude domain="sharedpref" path="." />
    <exclude domain="external" path="." />
    <exclude domain="device_root" path="." />
    <exclude domain="device_file" path="." />
    <exclude domain="device_database" path="." />
    <exclude domain="device_sharedpref" path="." />
</full-backup-content>`;

      const dataExtractionRules = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="root" path="." />
        <exclude domain="file" path="." />
        <exclude domain="database" path="." />
        <exclude domain="sharedpref" path="." />
        <exclude domain="external" path="." />
        <exclude domain="device_root" path="." />
        <exclude domain="device_file" path="." />
        <exclude domain="device_database" path="." />
        <exclude domain="device_sharedpref" path="." />
    </cloud-backup>
    <device-transfer>
        <exclude domain="root" path="." />
        <exclude domain="file" path="." />
        <exclude domain="database" path="." />
        <exclude domain="sharedpref" path="." />
        <exclude domain="external" path="." />
        <exclude domain="device_root" path="." />
        <exclude domain="device_file" path="." />
        <exclude domain="device_database" path="." />
        <exclude domain="device_sharedpref" path="." />
    </device-transfer>
</data-extraction-rules>`;

      fs.writeFileSync(
        path.join(xmlDirectory, 'backup_rules.xml'),
        backupRules,
      );

      fs.writeFileSync(
        path.join(xmlDirectory, 'data_extraction_rules.xml'),
        dataExtractionRules,
      );

      return config;
    },
  ]);

  return config;
};

export default withBackupOff;
