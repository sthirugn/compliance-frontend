import React, { useEffect } from 'react';
import propTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Alert, Text } from '@patternfly/react-core';
import { PageHeader, PageHeaderTitle, Main, SkeletonTable } from '@redhat-cloud-services/frontend-components';
import {
    ReportCardGrid, ReportsTable, StateViewPart, StateViewWithError, ReportsEmptyState, LoadingComplianceCards
} from 'PresentationalComponents';
import useFeature from 'Utilities/hooks/useFeature';

const QUERY = gql`
query Profiles($filter: String!) {
    profiles(search: $filter, limit: 1000){
        edges {
            node {
                id
                name
                refId
                description
                policyType
                totalHostCount
                testResultHostCount
                compliantHostCount
                unsupportedHostCount
                majorOsVersion
                ssgVersion
                complianceThreshold
                businessObjective {
                    id
                    title
                }
                policy {
                    id
                    name
                    benchmark {
                        id
                        version
                    }
                }
                benchmark {
                    id
                    version
                }
            }
        }

    }
}
`;

const profilesFromEdges = (data) => (
    (data?.profiles?.edges || []).map((profile) => (
        profile.node
    ))
);

const LoadingView = ({ showTableView }) => (
    showTableView ? <SkeletonTable colSize={ 3 } rowSize={ 10 } /> : <LoadingComplianceCards />
);

LoadingView.propTypes = {
    showTableView: propTypes.bool
};

const ReportsHeader = () => (
    <PageHeader>
        <PageHeaderTitle title="Reports" className="pad-bottom" />
        <Alert
            variant="info"
            isInline
            title= "Support for external reports will be removed in December 2020."
            actionLinks={
                <a href="https://access.redhat.com/solutions/5249481">Learn more</a>
            }>
            <Text variant="p">
                Support for SCAP policies NOT defined within Compliance has been removed. The associated reports for
                these policies will be removed from Insights by Jan 11th, 2020. Create a policy within the Compliance
                service for compliance reporting.
            </Text>
        </Alert>
    </PageHeader>
);

export const Reports = () => {
    let profiles = [];
    let showView = false;
    const location = useLocation();
    const showTableView = useFeature('reportsTableView');
    const View = showTableView ? ReportsTable : ReportCardGrid;
    const filter = `(has_policy_test_results = true AND external = false)
                    OR (has_policy = false AND has_test_results = true)`;

    let { data, error, loading, refetch } = useQuery(QUERY, {
        variables: { filter }
    });

    useEffect(() => {
        refetch();
    }, [location]);

    if (data) {
        profiles = profilesFromEdges(data);
        error = undefined;
        loading = undefined;
        showView = profiles && profiles.length > 0;
    }

    return <StateViewWithError stateValues={ { error, data, loading } }>
        <StateViewPart stateKey='loading'>
            <ReportsHeader />
            <Main>
                <LoadingView { ...{ showTableView } } />
            </Main>
        </StateViewPart>
        <StateViewPart stateKey='data'>
            <ReportsHeader />
            <Main>
                { showView ? <View { ...{ profiles } } /> : <ReportsEmptyState /> }
            </Main>
        </StateViewPart>
    </StateViewWithError>;
};

export default Reports;
