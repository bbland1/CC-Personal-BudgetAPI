const { envelopesDB, findById, findByName, createNewId, deleteById, deleteByName } = require('../db');


//  TODO: add some response codes for letting user know what is going on

// * function to get all the envelopes in the db
//  ! this would work for a real db call to catch any errors i believe
exports.getEnvelopes = async (req, res) => {
  try {
    const envelopes = await envelopesDB
    res.send(envelopes);
  } catch (err) {
    res.status(400).send(err);
  }
}

// * function to get a specific envelope
exports.getEnvelopesById = async (req, res) => {
  try {
    // ! make sure that the params that is being used is specified in the req call, forgot it and spent way too long thinking something else was wrong
    const envelopeId = req.params.id;

    // get the db info and use the db function to filter the db for what is being looked for
    const envelopes = await envelopesDB;
    const envelope = findById(envelopes, envelopeId);

    // if the envelope doesn't exist send a not found error
    if (!envelope) {
      // ! need to have a return otherwise the server kicks out a ERR_HTTP_HEADERS_SENT error because the header of the call is being changed after is was already set
      return res.status(404).send({
        message: `Envelope not found.`
      })
    }

    // send the envelope
    res.status(200).send(envelope);

  } catch (err) {
    // send a something went wrong error
    //  ? should this be a different error code
    res.status(500).send(err);
  }
}

//  * function to get the envelope by the name
exports.getEnvelopesByName = async (req, res) => {
  try {
    // ! make sure that the params that is being used is specified in the req call, forgot it and spent way too long thinking something else was wrong
    const envelopeName = req.params.name;

    // get the db info and use the db function to filter the db for what is being looked for
    const envelopes = await envelopesDB;
    const envelope = findByName(envelopes, envelopeName);

    // if the envelope doesn't exist send a not found error
    if (!envelope) {
      return res.status(404).send({
        message: `Envelope not found.`
      })
    }

    // send the envelope
    res.status(200).send(envelope);

  } catch (err) {
    // send a something went wrong error
    //  ? should this be a different error code
    res.status(500).send(err);
  }
}

// * add a new envelope
exports.addEnvelope = async (req, res) => {
  try {
    const { title, budget, saved } = req.body;

    const envelopes = await envelopesDB;
    // get a created id from the db
    const newId = createNewId(envelopes);

    // pass all the new info
    const newEnvelope = {
      id: newId,
      name: title,
      // changes these to numbers from the strings that are passed
      budget: parseInt(budget),
      amountSaved: parseInt(saved),
    }

    envelopes.push(newEnvelope);
    res.status(201).send(envelopes);
  } catch (err) {
    console.error(`There was an issue creating an ID for the envelope. Try again.`)
    res.status(500).send(err)
  }
}

// * transfer amount saved from one envelope to another
exports.transferEnvelopes = async (req, res) => {
  try {
    const from = req.params.from;
    const to = req.params.to;

    const { transfer } = req.body;

    const envelopes = await envelopesDB;

    const fromEnvelope = findByName(envelopes, from);
    const toEnvelope = findByName(envelopes, to);

    const transferNumber = parseInt(transfer);

    if (!fromEnvelope) {
      return res.status(404).send({
        message: `Envelope for ${from} not found.`
      })
    }

    if (!toEnvelope) {
      return res.status(404).send({
        message: `Envelope for ${to} not found.`
      })
    }

    if (typeof transferNumber !== 'number') {
      return res.status(400).send({
        message: `You didn't enter a number for the amount to transfer. Please try again.`
      })
    }

    fromEnvelope.amountSaved = fromEnvelope.amountSaved - transferNumber;
    toEnvelope.amountSaved = toEnvelope.amountSaved + transferNumber;

    res.status(202).send(envelopes);
  } catch (err) {
    res.status(500).send(err);
  }
}

// ? should the update routes have an additional mathematical update instead of just a full reset
// * update the envelope with the id
exports.updateEnvelopeById = async (req, res) => {
  try {
    const envelopeId = req.params.id;
    // ! the name of the parsed info needs to be what is passed in the req it seems. when trying it with dif variable names I kept getting undefined passed info
    const { title, budget, saved } = req.body;
    const envelopes = await envelopesDB;
    const envelope = findById(envelopes, envelopeId);

    if (!envelope) {
      return res.status(404).send({
        message: `Envelope not found.`
      })
    }

    const budgetNumber = parseInt(budget);
    const savedNumber = parseInt(saved);

    //  check if the values passed for the numbers are successfully changed to int to go into the db
    if (typeof savedNumber !== 'number' || typeof budgetNumber !== 'number') {
      return res.status(400).send({
        message: `You didn't enter numbers for either budget or amount saved. Please try again.`
      })
    }

    envelope.name = title;
    envelope.budget = budgetNumber;
    envelope.amountSaved = savedNumber;

    res.status(202).send(envelopes);
  } catch (err) {
    res.status(404).send(err)
  }
}

// * update the envelope with the name
exports.updateEnvelopeByName = async (req, res) => {
  try {
    const envelopeName = req.params.name;
    // ! the name of the parsed info needs to be what is passed in the req it seems. when trying it with dif variable names I kept getting undefined passed info
    const { title, budget, saved } = req.body;
    const envelopes = await envelopesDB;
    const envelope = findByName(envelopes, envelopeName);

    if (!envelope) {
      return res.status(404).send({
        message: `Envelope not found.`
      })
    }

    const budgetNumber = parseInt(budget);
    const savedNumber = parseInt(saved);

    //  check if the values passed for the numbers are successfully changed to int to go into the db
    if (typeof savedNumber !== 'number' || typeof budgetNumber !== 'number') {
      return res.status(400).send({
        message: `You didn't enter numbers for either budget or amount saved. Please try again.`
      })
    }

    envelope.name = title;
    envelope.budget = budgetNumber;
    envelope.amountSaved = savedNumber;

    res.status(202).send(envelopes);
  } catch (err) {
    res.status(404).send(err);
  }
}

// * delete an envelope by the id
exports.deleteEnvelopeById = async (req, res) => {
  try {
    const envelopeId = req.params.id;

    const envelopes = await envelopesDB;
    const envelope = findById(envelopes, envelopeId);

    if (!envelope) {
      return res.status(404).send({
        message: `Envelope not found.`
      })
    }

    const updatedEnvelopes = deleteById(envelopes, envelopeId);
    res.status(202).send(updatedEnvelopes);
  } catch (err) {
    res.status(500).send(err);
  }
}

// * delete an envelope by name
exports.deleteEnvelopeByName = async (req, res) => {
  try {
    const envelopeName = req.params.name;

    const envelopes = await envelopesDB;
    const envelope = findByName(envelopes, envelopeName);

    if (!envelope) {
      return res.status(404).send({
        message: `Envelope not found.`
      })
    }

    const updatedEnvelopes = deleteByName(envelopes, envelopeName);
    res.status(202).send(updatedEnvelopes);
  } catch (err) {
    res.status(500).send(err);
  }
}