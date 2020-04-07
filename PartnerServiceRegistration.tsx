import { RouteComponentProps } from 'react-router';
import * as React from 'react';
import { connect } from 'react-redux';

import { withErrorBoundary } from '@spa/components/error_boundary';
import { IPartnerService } from '@spa/models/partner_service';
import Loader from '@spa/ui/custom/loader';

import { loadServices } from '@spa/data/partner_services/actions';
import { selectServicesLoading, selectFailedToLoad, selectServicesLoaded, selectServices } from '@spa/data/partner_services/selectors';
import ServiceFeatures from './components/service_features';
import RegistrationConfirmation from './components/registration_confirmation';

interface IStateProps {
  loadingServices?: boolean;
  error?: boolean;
  service?: IPartnerService;
  servicesLoaded?: boolean;
}

const enum RegistrationStep {
  features = 'features',
  connection = 'connection',
}

interface IOwnProps extends RouteComponentProps<any, any> {}

interface IDispatchProps {
  loadServices: Function;
}

interface IPartnerServiceRegistrationState {
  step: RegistrationStep;
}

export class PartnerServiceRegistration extends React.Component<
  IOwnProps & IStateProps & IDispatchProps,
  IPartnerServiceRegistrationState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      step: RegistrationStep.features,
    };
    this.navigateToList = this.navigateToList.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
  }
  componentDidMount() {
    this.validateState();
  }
  componentDidUpdate() {
    this.validateState();
  }

  public render() {
    if (this.props.loadingServices || !this.props.servicesLoaded || !this.props.service) {
      return <Loader />;
    }
    const { service } = this.props;
    const { step } = this.state;
    if (step === RegistrationStep.features) {
      return <ServiceFeatures accept={this.handleAccept} cancel={this.navigateToList} service={service} />;
    }
    if (step === RegistrationStep.connection) {
      return <RegistrationConfirmation service={service} close={this.navigateToList} />;
    }
  }
  private handleAccept() {
    this.setState({ step: RegistrationStep.connection });
  }
  private navigateToList() {
    this.props.router.push('/app/services');
  }
  private validateState() {
    const serviceNotFound = this.props.servicesLoaded && !this.props.service;
    if (this.props.error || serviceNotFound) {
      this.navigateToList();
    }
    if (!this.props.servicesLoaded && !this.props.loadingServices) {
      this.props.loadServices();
    }
  }
}

const mapStateToProps = (state, ownProps: IOwnProps) => ({
  loadingServices: selectServicesLoading(state),
  error: selectFailedToLoad(state),
  servicesLoaded: selectServicesLoaded(state),
  service: (selectServices(state) || []).find((service) => service.name === ownProps.routeParams.serviceName),
});

const mapDispatchToProps = {
  loadServices,
};

export default withErrorBoundary<IOwnProps>(
  connect<IStateProps, IDispatchProps, IOwnProps>(
    mapStateToProps,
    mapDispatchToProps
  )(PartnerServiceRegistration)
);
