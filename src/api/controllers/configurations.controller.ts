import BaseController from './base.controller';
import ConfigurationModel, {Keys} from '../models/configuration.model';
import {NextFunction, Request, Response} from 'express';
import EmailController from './email.controller';
import sendGridMail from "@sendgrid/mail";

export default class ConfigurationsController extends BaseController {
  private _configurationModel = ConfigurationModel.getInstance().getModel();

  constructor() {
    super(ConfigurationModel.getInstance().getModel());
  }

  public async getConfiguration(req: Request, res: Response): Promise<any> {
    const key = req.params.key || null;
    if (key) {
      try {
        const configuration = await this._configurationModel.findOne({
          key: key,
        });
        if (configuration) {
          return res.status(200).send(configuration).end();
        } else {
          return res
            .status(404)
            .send({ success: false, message: 'Configuration not found.' });
        }
      } catch (err) {
        return res
          .status(500)
          .send({
            success: false,
            message: `There was an error fetching the configuration ${err}`,
          });
      }
    } else {
      super.list(req, res);
    }
    return null;
  }

  public async addConfiguration(req: Request, res: Response): Promise<any> {
    if (Object.values(Keys).includes(req.body.key)) {
      try {
        const keysFound = await this._configurationModel.findOne({
          key: req.body.key,
        });
        if (keysFound) {
          console.log(keysFound);
          return res
            .status(500)
            .send({
              success: false,
              message:
                'Key already present. Please use the update api for this key.',
            })
            .end();
        } else {
          super.add(req, res);
        }
      } catch (err) {
        return res
          .status(500)
          .send({
            success: false,
            message: `There was an error fetching the configuration ${err}`,
          });
      }
    } else {
      return res
        .status(500)
        .send({ success: false, message: 'Invalid Key provided.' })
        .end();
    }
    return null
  }

  public async updateConfigurationByKey(req: Request, res: Response) {
    const key = req.params.key || null;

    if (key) {
      try {
        const updatedConfiguration =
          await this._configurationModel.findOneAndUpdate(
            { key: key },
            req.body,
            { new: true }
          );
        if (updatedConfiguration) {
          return res.status(200).send(updatedConfiguration);
        } else {
          return res
            .status(404)
            .send({
              success: false,
              message: 'Invalid configuration key provided.',
            });
        }
      } catch (err) {
        return res
          .status(500)
          .send({
            success: false,
            message: `There was an error updating the configuration ${err}`,
          });
      }
    } else {
      return res
        .status(400)
        .send({ success: false, message: 'Key Not provided.' });
    }
  }

  public async deleteConfigurationByKey(req: Request, res: Response) {
    const key = req.params.key || null;

    if (key) {
      try {
        const deletedConfiguration =
          await this._configurationModel.findOneAndDelete({ key: key });
        if (deletedConfiguration) {
          return res.status(200).send(deletedConfiguration);
        } else {
          return res
            .status(404)
            .send({
              success: false,
              message: 'Invalid configuration Key provided.',
            });
        }
      } catch (err) {
        return res
          .status(500)
          .send({
            success: false,
            message: `There was an error updating the configuration ${err}`,
          });
      }
    } else {
      return res
        .status(400)
        .send({ success: false, message: 'Key Not provided.' });
    }
  }

  public async sendContactUsEmail(req: Request, res: Response) {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      service,
      userType,
      topic,
    } = req.body;
    try {
      if (
        firstName &&
        lastName &&
        phoneNumber &&
        email &&
        service &&
        userType &&
        topic
      ) {
        EmailController.sendContactUsEmail(req.body);
        return res.status(200).send({ success: true, message: 'Email Sent!' });
      } else {
        return res
          .status(400)
          .send({
            success: false,
            message: 'Please provide all the required fields.',
          });
      }
    } catch (error) {
      console.log('Error sending the email: ' + error);
      return res
        .status(200)
        .send({ success: false, message: `Error Sending the email ${error}` });
    }
  }
}
