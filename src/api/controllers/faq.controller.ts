import {Request, Response} from 'express';
import FaqModel from "../models/faq.model";
import BaseController from "./base.controller";

export default class FaqController extends BaseController {
  private _faqModel = FaqModel.getInstance().getModel();

  constructor() {
    super(FaqModel.getInstance().getModel());
  }

  public async getFaqs(req: Request, res: Response): Promise<any> {
    const id = req.params.id || null;
    if (id) {
      try {
        const faq = await this._faqModel.findById(id);
        if (faq) {
          return res.status(200).send(faq).end();
        } else {
          return res
            .status(404)
            .send({ success: false, message: 'Faq not found.' });
        }
      } catch (err) {
        return res
          .status(500)
          .send({
            success: false,
            message: `There was an error fetching the faq ${err}`,
          });
      }
    } else {
      super.list(req, res);
    }
    return null
  }

  public async addFaq(req: Request, res: Response) {
    super.add(req, res);
  }

  public async updateFaq(req: Request, res: Response) {
    super.update(req, res);
  }

  public async deleteFaq(req: Request, res: Response) {
    super.delete(req, res);
  }
}
