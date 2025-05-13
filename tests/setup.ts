// This file is used by Jest as a setup file to configure the test environment
// It ensures consistent behavior between command line and VS Code Jest extension
import { jest } from '@jest/globals';


// Ensure that Jest's ESM support is working properly
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--experimental-vm-modules';

// Configure Jest to properly handle ESM
// This is especially important for the VS Code Jest extension
jest.setTimeout(30000); 