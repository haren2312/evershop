import { SettingMenu } from '@components/admin/SettingMenu.js';
import Spinner from '@components/admin/Spinner.js';
import { Form } from '@components/common/form/Form.js';
import { SelectField } from '@components/common/form/SelectField.js';
import { Button } from '@components/common/ui/Button.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@components/common/ui/Dialog.js';
import React from 'react';
import { useQuery } from 'urql';
import { TaxClasses } from './components/TaxClasses.js';
import { TaxClassForm } from './components/TaxClassForm.js';

const CountriesQuery = `
  query Country($countries: [String]) {
    countries (countries: $countries) {
      value: code
      label: name
      provinces {
        value: code
        label: name
      }
    }
  }
`;

const TaxClassesQuery = `
  query TaxClasses {
    taxClasses {
      items {
        taxClassId
        uuid
        name
        rates {
          taxRateId
          uuid
          name
          rate
          isCompound
          country
          province
          postcode
          priority
          updateApi
          deleteApi
        }
        addRateApi
      }
    }
  }
`;

interface TaxSettingProps {
  createTaxClassApi: string;
  saveSettingApi: string;
  setting: {
    defaultProductTaxClassId?: number;
    defaultShippingTaxClassId?: number;
    baseCalculationAddress?: string;
  };
}
export default function TaxSetting({
  createTaxClassApi,
  saveSettingApi,
  setting
}: TaxSettingProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [countriesQueryData] = useQuery({
    query: CountriesQuery
  });

  const [taxClassesQueryData, reexecuteQuery] = useQuery({
    query: TaxClassesQuery
  });

  if (countriesQueryData.fetching || taxClassesQueryData.fetching) {
    return (
      <div className="main-content-inner">
        <div className="grid grid-cols-6 gap-x-5 grid-flow-row ">
          <div className="col-span-2">
            <SettingMenu />
          </div>
          <div className="col-span-4">
            <Card>
              <CardContent>
                <Spinner width={30} height={30} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-inner">
      <div className="grid grid-cols-6 gap-x-5 grid-flow-row ">
        <div className="col-span-2">
          <SettingMenu />
        </div>
        <div className="col-span-4 grid grid-cols-1 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Tax calculation configuration</CardTitle>
              <CardDescription>
                Configure the tax classes that will be available to your
                customers at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent title="Basic configuration">
              <Form
                id="taxBasicConfig"
                method="POST"
                action={saveSettingApi}
                successMessage="Tax setting has been saved successfully!"
              >
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <SelectField
                      name="defaultShippingTaxClassId"
                      label="Shipping tax class"
                      defaultValue={setting.defaultShippingTaxClassId}
                      placeholder="None"
                      options={[
                        {
                          value: -1,
                          label: 'Proportional allocation based on cart items'
                        },
                        {
                          value: 0,
                          label: 'Higest tax rate based on cart items'
                        }
                      ].concat(
                        taxClassesQueryData.data.taxClasses.items.map(
                          (taxClass) => ({
                            value: taxClass.taxClassId,
                            label: taxClass.name
                          })
                        ) || []
                      )}
                      helperText="This is the tax class applied to shipping costs."
                    />
                  </div>
                  <div>
                    <SelectField
                      name="baseCalculationAddress"
                      label="Base calculation address"
                      defaultValue={setting.baseCalculationAddress || ''}
                      options={[
                        {
                          value: 'shippingAddress',
                          label: 'Shipping address'
                        },
                        {
                          value: 'billingAddress',
                          label: 'Billing address'
                        },
                        {
                          value: 'storeAddress',
                          label: 'Store address'
                        }
                      ]}
                      helperText="This is the address used to calculate tax rates."
                    />
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
          <Card title="Tax classes">
            <CardHeader>
              <CardTitle>Tax classes</CardTitle>
              <CardDescription>
                Manage tax classes and tax rates for different regions.
              </CardDescription>
            </CardHeader>
            <TaxClasses
              classes={taxClassesQueryData.data.taxClasses.items}
              getTaxClasses={reexecuteQuery}
            />
            <CardContent>
              <div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger>
                    <Button
                      title="Create new tax class"
                      variant="outline"
                      onClick={() => setDialogOpen(true)}
                    >
                      Create new tax class
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Tax Class</DialogTitle>
                    </DialogHeader>
                    <TaxClassForm
                      saveTaxClassApi={createTaxClassApi}
                      closeModal={() => setDialogOpen(false)}
                      getTaxClasses={reexecuteQuery}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    createTaxClassApi: url(routeId: "createTaxClass")
    saveSettingApi: url(routeId: "saveSetting")
    setting {
      defaultProductTaxClassId
      defaultShippingTaxClassId
      baseCalculationAddress
    }
  }
`;
