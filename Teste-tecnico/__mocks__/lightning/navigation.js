
const navigateMock = jest.fn();

const Navigate = Symbol('Navigate');

const NavigationMixin = (Base) => {
    class Mixin extends Base {
        [Navigate](pageReference) {
            navigateMock(pageReference);
        }
    }
    return Mixin;
};

NavigationMixin.Navigate = Navigate;

export { NavigationMixin, navigateMock };