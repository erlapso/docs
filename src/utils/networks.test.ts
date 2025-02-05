import { isNetworkAdded, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { renderHook, act } from '@testing-library/react-hooks';
import { useNetwork, NetworkType } from '../utils/networks';import { useNetwork, NetworkType } from '../utils/networks';
import { renderHook, act } from '@testing-library/react-hooks';









/**
 * Tests the isNetworkAdded function for both successful and failed scenarios.
 * This test covers:
 * 1. When the network is added and matches the expected chainId
 * 2. When the network is not added (chainId doesn't match)
 * 3. When an error occurs during the check
 */
describe('isNetworkAdded', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset the window object before each test
    global.window = { ...originalWindow };
  });

  afterAll(() => {
    // Restore the original window object after all tests
    global.window = originalWindow;
  });

  it('should return true when the network is added', async () => {
    // Mock the ethereum object
    (global.window as any).ethereum = {
      request: jest.fn().mockResolvedValue('0xdef1'),
    };

    const result = await isNetworkAdded('mainnet');
    expect(result).toBe(true);
  });

  it('should return false when the network is not added', async () => {
    // Mock the ethereum object with a different chainId
    (global.window as any).ethereum = {
      request: jest.fn().mockResolvedValue('0x1'),
    };

    const result = await isNetworkAdded('mainnet');
    expect(result).toBe(false);
  });

  it('should return false when an error occurs', async () => {
    // Mock the ethereum object to throw an error
    (global.window as any).ethereum = {
      request: jest.fn().mockRejectedValue(new Error('Some error')),
    };

    const result = await isNetworkAdded('mainnet');
    expect(result).toBe(false);
  });

  it('should return false when ethereum is not available', async () => {
    // Remove the ethereum object from the window
    delete (global.window as any).ethereum;

    const result = await isNetworkAdded('mainnet');
    expect(result).toBe(false);
  });
});
/**
 * Tests the useNetwork hook for the following scenarios:
 * 1. Initial state when wallet is not installed
 * 2. State updates when wallet is installed
 * 3. Behavior of addNetwork function
 * 4. Behavior of selectNetwork function
 */
describe('useNetwork', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should handle wallet installation, network addition, and selection', async () => {
    // Initial render without wallet
    delete (global.window as any).ethereum;
    const { result, rerender } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(false);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Simulate wallet installation
    (global.window as any).ethereum = mockEthereum;
    mockEthereum.request.mockResolvedValueOnce('0x1'); // Different chain ID
    rerender();

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check updated state after wallet installation
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Test addNetwork function
    mockEthereum.request.mockResolvedValueOnce(undefined); // wallet_addEthereumChain
    mockEthereum.request.mockResolvedValueOnce(undefined); // wallet_switchEthereumChain
    await act(async () => {
      await result.current.addNetwork();
    });

    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'wallet_addEthereumChain',
      params: [expect.any(Object)],
    });

    // Test selectNetwork function
    mockEthereum.request.mockResolvedValueOnce(undefined); // wallet_switchEthereumChain
    await act(async () => {
      await result.current.selectNetwork();
    });

    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xdef1' }],
    });

    // Simulate successful network change
    mockEthereum.request.mockResolvedValueOnce('0xdef1');
    await act(async () => {
      mockEthereum.on.mock.calls[0][1](); // Trigger chainChanged event
    });

    // Check final state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(true);
    expect(result.current.isSelected).toBe(true);
  });
});
/**
 * Tests the useNetwork hook for the scenario where the network is added but not selected.
 * This test covers:
 * 1. Initial state when the network is added but not selected
 * 2. Behavior of selectNetwork function when switching to an added network
 * 3. State updates after network selection
 */
describe('useNetwork - network added but not selected', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should handle network selection when network is added but not selected', async () => {
    // Mock initial state: wallet installed, network added but not selected
    mockEthereum.request.mockResolvedValueOnce('0x1'); // Initial chain ID (not the target network)

    const { result } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Simulate network already added in wallet
    mockEthereum.request.mockImplementation(async ({ method }) => {
      if (method === 'wallet_switchEthereumChain') {
        return null; // Successful switch
      }
      if (method === 'eth_chainId') {
        return '0xdef1'; // New chain ID after switch
      }
    });

    // Call selectNetwork
    await act(async () => {
      await result.current.selectNetwork();
    });

    // Simulate chain change event
    await act(async () => {
      mockEthereum.on.mock.calls[0][1](); // Trigger chainChanged event
    });

    // Check final state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(true);
    expect(result.current.isSelected).toBe(true);

    // Verify that wallet_switchEthereumChain was called
    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xdef1' }],
    });
  });
});
/**
 * Tests the useNetwork hook for the scenario where adding a network fails.
 * This test covers:
 * 1. Initial state when the wallet is installed
 * 2. Behavior of addNetwork function when an error occurs
 * 3. State updates after a failed network addition
 */
describe('useNetwork - failed network addition', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should handle error when adding network fails', async () => {
    // Mock initial state: wallet installed, network not added
    mockEthereum.request.mockResolvedValueOnce('0x1'); // Initial chain ID (not the target network)

    const { result } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Mock error when adding network
    mockEthereum.request.mockRejectedValueOnce(new Error('Failed to add network'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Call addNetwork
    await act(async () => {
      await result.current.addNetwork();
    });

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error adding network:', expect.any(Error));

    // Check that state remains unchanged
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Verify that wallet_addEthereumChain was called
    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'wallet_addEthereumChain',
      params: [expect.any(Object)],
    });

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});

... existing code
/**
 * Tests the useNetwork hook for the scenario where the wallet is installed,
 * but the network is not added, and an attempt is made to select the network.
 * This test covers:
 * 1. Initial state when the wallet is installed but network is not added
 * 2. Behavior of selectNetwork function when the network is not added
 * 3. Error handling in selectNetwork function
 * 4. State updates after a failed network selection
 */
describe('useNetwork - select non-existent network', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should handle error when selecting a non-existent network', async () => {
    // Mock initial state: wallet installed, network not added
    mockEthereum.request.mockResolvedValueOnce('0x1'); // Initial chain ID (not the target network)

    const { result } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Mock error when switching network
    mockEthereum.request.mockRejectedValueOnce(new Error('Chain not added'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Call selectNetwork
    await act(async () => {
      await result.current.selectNetwork();
    });

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error switching network:', expect.any(Error));

    // Check that state remains unchanged
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Verify that wallet_switchEthereumChain was called
    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xdef1' }],
    });

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});

... existing code
/**
 * Tests the useNetwork hook for the scenario where the network is added,
 * but an error occurs when trying to select the network.
 * This test covers:
 * 1. Initial state when the wallet is installed and network is added
 * 2. Error handling in selectNetwork function when network switch fails
 * 3. State updates after a failed network selection
 */
describe('useNetwork - network added but selection fails', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should handle error when selecting an added network fails', async () => {
    // Mock initial state: wallet installed, network added but not selected
    mockEthereum.request.mockResolvedValueOnce('0xdef1'); // Initial chain ID (matches the target network)

    const { result } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(true);
    expect(result.current.isSelected).toBe(true);

    // Mock error when switching network
    mockEthereum.request.mockRejectedValueOnce(new Error('Failed to switch network'));

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Call selectNetwork
    await act(async () => {
      await result.current.selectNetwork();
    });

    // Check that error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error switching network:', expect.any(Error));

    // Check that state remains unchanged
    expect(result.current.isAdded).toBe(true);
    expect(result.current.isSelected).toBe(true);

    // Verify that wallet_switchEthereumChain was called
    expect(mockEthereum.request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xdef1' }],
    });

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});

... existing code
/**
 * Tests the useNetwork hook for the scenario where the network changes after initial render.
 * This test covers:
 * 1. Initial state when the wallet is installed and network is not the target
 * 2. Behavior when the network changes to the target network
 * 3. State updates after the network change event
 */
describe('useNetwork - network change after initial render', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should update state when network changes to target network', async () => {
    // Mock initial state: wallet installed, network not target
    mockEthereum.request.mockResolvedValueOnce('0x1'); // Initial chain ID (not the target network)

    const { result } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Mock chain change to target network
    mockEthereum.request.mockResolvedValueOnce('0xdef1'); // New chain ID (target network)

    // Simulate chainChanged event
    await act(async () => {
      const chainChangedCallback = mockEthereum.on.mock.calls.find(call => call[0] === 'chainChanged')[1];
      chainChangedCallback();
    });

    // Wait for state update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check updated state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(true);
    expect(result.current.isSelected).toBe(true);

    // Verify that eth_chainId was called after chain change
    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_chainId' });
  });
});

... existing code
/**
 * Tests the useNetwork hook for the scenario where the wallet is not installed initially,
 * but then gets installed during the component's lifecycle.
 * This test covers:
 * 1. Initial state when the wallet is not installed
 * 2. State updates when the wallet becomes available
 * 3. Behavior of the hook after wallet installation
 */
describe('useNetwork - wallet installation during lifecycle', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    delete (global.window as any).ethereum;
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should update state when wallet is installed after initial render', async () => {
    const { result, rerender } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Check initial state (wallet not installed)
    expect(result.current.isWalletInstalled).toBe(false);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Simulate wallet installation
    (global.window as any).ethereum = mockEthereum;
    mockEthereum.request.mockResolvedValueOnce('0x1'); // Different chain ID

    // Trigger re-render to detect wallet installation
    rerender();

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check updated state after wallet installation
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Simulate switching to the correct network
    mockEthereum.request.mockResolvedValueOnce('0xdef1'); // Correct chain ID for mainnet

    // Trigger chainChanged event
    await act(async () => {
      const chainChangedCallback = mockEthereum.on.mock.calls.find(call => call[0] === 'chainChanged')[1];
      chainChangedCallback();
    });

    // Wait for state update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check final state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(true);
    expect(result.current.isSelected).toBe(true);

    // Verify that eth_chainId was called after chain change
    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_chainId' });
  });
});

... existing code
/**
 * Tests the useNetwork hook for the scenario where the wallet is installed
 * but the Ethereum object becomes unavailable (e.g., user logs out).
 * This test covers:
 * 1. Initial state when the wallet is installed and Ethereum object is available
 * 2. State updates when the Ethereum object becomes unavailable
 * 3. Behavior of the hook after Ethereum object removal
 */
describe('useNetwork - Ethereum object becomes unavailable', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should update state when Ethereum object becomes unavailable', async () => {
    // Mock initial state: wallet installed, Ethereum object available
    mockEthereum.request.mockResolvedValueOnce('0xdef1'); // Correct chain ID for mainnet

    const { result, rerender } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(true);
    expect(result.current.isSelected).toBe(true);

    // Simulate Ethereum object becoming unavailable
    delete (global.window as any).ethereum;

    // Trigger re-render to detect Ethereum object removal
    rerender();

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check updated state after Ethereum object removal
    expect(result.current.isWalletInstalled).toBe(false);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Try to add network (should not throw error)
    await act(async () => {
      await result.current.addNetwork();
    });

    // Try to select network (should not throw error)
    await act(async () => {
      await result.current.selectNetwork();
    });

    // State should remain unchanged
    expect(result.current.isWalletInstalled).toBe(false);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);
  });
});

... existing code
/**
 * Tests the useNetwork hook for the scenario where the network changes to a non-target network after initial render.
 * This test covers:
 * 1. Initial state when the wallet is installed and network is not the target
 * 2. Behavior when the network changes to another non-target network
 * 3. State updates after the network change event
 */
describe('useNetwork - network change to non-target network', () => {
  const originalWindow = global.window;
  let mockEthereum: any;

  beforeEach(() => {
    global.window = { ...originalWindow };
    mockEthereum = {
      request: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    (global.window as any).ethereum = mockEthereum;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should update state when network changes to a non-target network', async () => {
    // Mock initial state: wallet installed, network not target
    mockEthereum.request.mockResolvedValueOnce('0x1'); // Initial chain ID (not the target network)

    const { result } = renderHook(() => useNetwork('mainnet' as NetworkType));

    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check initial state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Mock chain change to another non-target network
    mockEthereum.request.mockResolvedValueOnce('0x2'); // New chain ID (another non-target network)

    // Simulate chainChanged event
    await act(async () => {
      const chainChangedCallback = mockEthereum.on.mock.calls.find(call => call[0] === 'chainChanged')[1];
      chainChangedCallback();
    });

    // Wait for state update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Check updated state
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.isAdded).toBe(false);
    expect(result.current.isSelected).toBe(false);

    // Verify that eth_chainId was called after chain change
    expect(mockEthereum.request).toHaveBeenCalledWith({ method: 'eth_chainId' });
  });
});

... existing code
