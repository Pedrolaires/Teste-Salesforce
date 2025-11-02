import { createElement } from 'lwc';
import SearchBar from 'c/searchBar';

describe('c-search-bar', () => {
    
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('shouldnt dispatch evt immediatly', () => {
        const element = createElement('c-search-bar', { is: SearchBar });
        document.body.appendChild(element);

        const searchHandler = jest.fn();
        element.addEventListener('search', searchHandler);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = 'Test';
        input.dispatchEvent(new CustomEvent('keyup', {
             target: {
                 value: 'Test' 
                } 
            }
        ));

        jest.advanceTimersByTime(200);

        expect(searchHandler).not.toHaveBeenCalled();
    });

    it('should dispatch srch evt once before 300ms', () => {
        const element = createElement('c-search-bar', {
             is: SearchBar 
            }
        );
        document.body.appendChild(element);

        const searchHandler = jest.fn();
        element.addEventListener('search', searchHandler);

        const input = element.shadowRoot.querySelector('lightning-input');
        input.value = 'Test';
        input.dispatchEvent(new CustomEvent('keyup', {
            target: {
                value: 'Test' 
            } 
        }));


        jest.advanceTimersByTime(300);

        expect(searchHandler).toHaveBeenCalledTimes(1);
        expect(searchHandler.mock.calls[0][0].detail.value).toBe('Test');
    });

    it('should dispatch srch evt once', () => {
        const element = createElement('c-search-bar', {
            is: SearchBar 
            }
        );
        document.body.appendChild(element);

        const searchHandler = jest.fn();
        element.addEventListener('search', searchHandler);

        const input = element.shadowRoot.querySelector('lightning-input');
        
        input.value = 'T';
        input.dispatchEvent(new CustomEvent('keyup', {
             target: {
                 value: 'T' 
                } 
            }
        ));
        jest.advanceTimersByTime(100);

        input.value = 'TE';
        input.dispatchEvent(new CustomEvent('keyup', {
             target: {
                 value: 'TE' 
                } 
            }
        ));
        jest.advanceTimersByTime(100);
        
        input.value = 'TES';
        input.dispatchEvent(new CustomEvent('keyup', {
             target: {
                 value: 'TES' 
                } 
            }
        ));
        expect(searchHandler).not.toHaveBeenCalled();
        
        jest.advanceTimersByTime(300); 
        expect(searchHandler).toHaveBeenCalledTimes(1);
        expect(searchHandler.mock.calls[0][0].detail.value).toBe('TES');
    });
});