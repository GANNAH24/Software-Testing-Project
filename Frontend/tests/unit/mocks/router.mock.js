import { vi } from 'vitest';

export const mockNavigate = vi.fn();
export const mockUseLocation = vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
}));

const routerMock = async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: mockUseLocation,
    };
};

export default routerMock;
