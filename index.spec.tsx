import * as React from 'react';
import { shallow } from 'enzyme';

import Loader from '@spa/ui/custom/loader';

jest.mock('@stat/trackError', () => jest.fn());

import { PartnerServiceRegistration } from '../index';
import { IPartnerService, PartnerServiceName, PartnerServiceState } from '../../../../models/partner_service';
import ServiceFeatures from '../components/service_features';
import RegistrationConfirmation from '../components/registration_confirmation';

describe('PartnerServiceRegistration', () => {
  const mockService: Partial<IPartnerService> = {
    loginUrl: 'loginUrl',
    description: [{ title: 'title', rows: ['row1', 'row2'] }],
    logoBase64: 'logoBase64',
    msg: 'msg',
    name: PartnerServiceName.CUBE,
    shortDescription: 'shortDescription',
    state: PartnerServiceState.DISABLE,
    tagline: 'tagline',
    title: 'service title',
    registrationUrl: 'registrationUrl',
    isOtpValidationEnabled: true,
  };
  let routeProps;
  let loadServices;
  beforeEach(() => {
    loadServices = jest.fn();
    routeProps = {
      router: { push: jest.fn() },
    };
  });
  it('should load services on mount if not loaded', () => {
    shallow(<PartnerServiceRegistration loadServices={loadServices} servicesLoaded={false} {...routeProps} />);
    expect(loadServices).toHaveBeenCalled();
  });
  it('should navigate to list if failed to load', () => {
    shallow(<PartnerServiceRegistration loadServices={loadServices} servicesLoaded={true} error={true} {...routeProps} />);
    expect(routeProps.router.push).toHaveBeenCalledWith('/app/services');
  });
  it('should navigate to list if  service not found (corrupted url)', () => {
    shallow(<PartnerServiceRegistration loadServices={loadServices} servicesLoaded={true} service={null} error={false} {...routeProps} />);
    expect(routeProps.router.push).toHaveBeenCalledWith('/app/services');
  });
  it('should render service features on load', () => {
    const wrapper = shallow(
      <PartnerServiceRegistration loadServices={loadServices} servicesLoaded={true} service={mockService} error={false} {...routeProps} />
    );
    expect(wrapper.find(ServiceFeatures).exists()).toBe(true);
    expect(wrapper.find(RegistrationConfirmation).exists()).toBe(false);
  });
  it('should render connection phase when user confirmed connection', () => {
    const wrapper = shallow<PartnerServiceRegistration>(
      <PartnerServiceRegistration loadServices={loadServices} servicesLoaded={true} service={mockService} error={false} {...routeProps} />
    );
    wrapper.find(ServiceFeatures).prop('accept')();
    expect(wrapper.find(ServiceFeatures).exists()).toBe(false);
    expect(wrapper.find(RegistrationConfirmation).exists()).toBe(true);
  });
  it('should render loader if services not loaded', () => {
    const wrapper = shallow(
      <PartnerServiceRegistration
        loadServices={loadServices}
        servicesLoaded={false}
        loadingServices={true}
        service={null}
        error={false}
        {...routeProps}
      />
    );
    expect(wrapper.contains(<Loader />));
  });
  it('should not call services api if already loading on component update', () => {
    let loading = false;
    const loadServices = jest.fn(() => (loading = true));
    const wrapper = shallow(
      <PartnerServiceRegistration
        loadServices={loadServices}
        servicesLoaded={false}
        loadingServices={loading}
        service={null}
        error={false}
        {...routeProps}
      />
    );
    expect(loadServices).toHaveBeenCalledTimes(1);
    wrapper.setProps({ loadingServices: loading });
    expect(loadServices).toHaveBeenCalledTimes(1);
  });
});
